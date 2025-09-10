if(!window.Telegram){
    window.Telegram = { WebApp:{ sendData:(data)=>console.log('Telegram sendData:',data) } };
}

// =================== Переменные и элементы ===================
let canvas = document.getElementById('chart');
let ctx = canvas.getContext('2d');
let liveX = document.getElementById('liveX');
let historyDiv = document.getElementById('history');
let playBtn = document.getElementById('playBtn');
let cashoutBtn = document.getElementById('cashoutBtn');
let balance = 100.0;
let gameRunning = false;
let betAmount = 0;
let multiplier = 1.0;
let crashPoint = 0;
let interval;
let history = [];

// =================== Canvas resize ===================
function resizeCanvas(){
    canvas.width = canvas.clientWidth;
    canvas.height = 420;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// =================== История ===================
function updateHistory(){
    historyDiv.innerHTML = '';
    history.slice(-10).forEach(h=>{
        let chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = h;
        historyDiv.appendChild(chip);
    });
}

// =================== Сброс игры ===================
function resetGame(){
    multiplier = 1.0;
    liveX.innerText = multiplier.toFixed(2)+'x';
    cashoutBtn.disabled = true;
    playBtn.disabled = false;
}

// =================== Рисуем свечи ===================
function drawCandles(mult){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let h = canvas.height;
    let w = canvas.width;
    ctx.beginPath();
    ctx.moveTo(0,h);
    for(let i=0;i<w;i++){
        let y = h - Math.log(mult + i/100)*50;
        ctx.lineTo(i,y);
    }
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// =================== Старт игры ===================
function startGame(){
    gameRunning = true;
    cashoutBtn.disabled = false;
    playBtn.disabled = true;
    multiplier = 1.0;
    crashPoint = 1.0 + Math.random()*5;
    interval = setInterval(()=>{
        if(!gameRunning) return;
        multiplier += 0.01 + Math.random()*0.02; 
        drawCandles(multiplier);
        liveX.innerText = multiplier.toFixed(2)+'x';
        if(multiplier >= crashPoint){
            gameRunning = false;
            clearInterval(interval);
            alert('Крах! Вы проиграли '+betAmount.toFixed(1)+' TON');
            history.push(multiplier.toFixed(2)+'x');
            updateHistory();
            resetGame();
        }
    },50);
}

// =================== PLAY ===================
playBtn.addEventListener('click', ()=>{
    if(gameRunning) return;
    betAmount = parseFloat(prompt("Введите ставку (TON):", "1.0"));
    if(!betAmount || betAmount <= 0 || betAmount > balance){
        alert('Неверная ставка или недостаточно средств');
        return;
    }
    balance -= betAmount;
    document.getElementById('balanceLabel').innerText = balance.toFixed(1)+' TON';
    startGame();
});

// =================== CASHOUT ===================
cashoutBtn.addEventListener('click', ()=>{
    if(!gameRunning) return;
    gameRunning = false;
    clearInterval(interval);
    let win = betAmount * multiplier;
    balance += win;
    document.getElementById('balanceLabel').innerText = balance.toFixed(1)+' TON';
    history.push(multiplier.toFixed(2)+'x');
    updateHistory();
    alert('Вы забрали: '+win.toFixed(1)+' TON');
    resetGame();
});

// =================== Модалка TON и Gifts ===================
const betModal = document.getElementById('betModal');
const tonTabBtn = document.querySelector('.tab[data-tab="ton"]');
const giftsTabBtn = document.querySelector('.tab[data-tab="gifts"]');
const tonTab = document.getElementById('tonTab');
const giftsTab = document.getElementById('giftsTab');
const tonInput = document.getElementById('tonInput');
const buyTonBtn = document.getElementById('buyTonBtn');
const giftsGrid = document.getElementById('giftsGrid');
const buyGiftBtn = document.getElementById('buyGiftBtn');
const depositBtn = document.getElementById('depositBtn');

// Пример подарков
let gifts = [
    {name:'🎁 Gift A', value:5},
    {name:'🎉 Gift B', value:10},
    {name:'🏆 Gift C', value:20},
    {name:'💎 Gift D', value:50}
];

// Render gifts
function renderGifts(){
    giftsGrid.innerHTML='';
    gifts.forEach((g,i)=>{
        let div = document.createElement('div');
        div.className='gift';
        div.innerHTML=`<div class="gift-name">${g.name}</div><div class="gift-val">${g.value} TON</div>`;
        div.onclick=()=>{
            document.querySelectorAll('.gift').forEach(el=>el.classList.remove('selected'));
            div.classList.add('selected');
            buyGiftBtn.disabled=false;
        };
        giftsGrid.appendChild(div);
    });
}
renderGifts();

// Открытие модалки
depositBtn.addEventListener('click', ()=>{ betModal.classList.remove('hidden'); });

// Вкладки TON/Gifts
tonTabBtn.addEventListener('click', ()=>{
    tonTabBtn.classList.add('active'); giftsTabBtn.classList.remove('active');
    tonTab.classList.remove('hidden'); giftsTab.classList.add('hidden');
});
giftsTabBtn.addEventListener('click', ()=>{
    giftsTabBtn.classList.add('active'); tonTabBtn.classList.remove('active');
    giftsTab.classList.remove('hidden'); tonTab.classList.add('hidden');
});

// Покупка TON
buyTonBtn.addEventListener('click', ()=>{
    let amount = parseFloat(tonInput.value);
    if(!amount || amount<=0){ alert('Введите корректное количество TON'); return; }
    balance += amount;
    document.getElementById('balanceLabel').innerText = balance.toFixed(1)+' TON';
    tonInput.value='';
    betModal.classList.add('hidden');
});

// =================== Инвентарь ===================
let inventory = [];
const inventoryDiv = document.createElement('div');
inventoryDiv.style.position='fixed';
inventoryDiv.style.bottom='16px';
inventoryDiv.style.left='16px';
inventoryDiv.style.right='16px';
inventoryDiv.style.background='rgba(17,24,39,0.9)';
inventoryDiv.style.border='1px solid rgba(96,165,250,0.25)';
inventoryDiv.style.borderRadius='14px';
inventoryDiv.style.padding='10px';
inventoryDiv.style.maxHeight='200px';
inventoryDiv.style.overflowY='auto';
inventoryDiv.style.zIndex='30';
document.body.appendChild(inventoryDiv);

function updateInventory(){
    inventoryDiv.innerHTML='';
    inventory.forEach((item,i)=>{
        let div = document.createElement('div');
        div.style.display='flex';
        div.style.justifyContent='space-between';
        div.style.alignItems='center';
        div.style.padding='6px';
        div.style.marginBottom='4px';
        div.style.background='rgba(27,36,64,0.8)';
        div.style.borderRadius='10px';
        div.innerHTML = `<span>${item.name} (${item.value} TON)</span>`;
        let btnWrap = document.createElement('div');
        let withdrawBtn = document.createElement('button'); withdrawBtn.innerText='Вывести';
        withdrawBtn.style.marginRight='4px';
        withdrawBtn.onclick = ()=>{
            Telegram.WebApp.sendData(JSON.stringify({action:'withdraw',item:item}));
            alert(`Запрос на вывод ${item.name} отправлен`);
        };
        let sellBtn = document.createElement('button'); sellBtn.innerText='Продать';
        sellBtn.onclick = ()=>{
            balance += item.value;
            document.getElementById('balanceLabel').innerText = balance.toFixed(1)+' TON';
            inventory.splice(i,1);
            updateInventory();
            alert(`Вы продали ${item.name} за ${item.value} TON`);
        };
        btnWrap.appendChild(withdrawBtn); btnWrap.appendChild(sellBtn); div.appendChild(btnWrap);
        inventoryDiv.appendChild(div);
    });
}
function addGiftToInventory(gift){ inventory.push(gift); updateInventory(); }

// Покупка подарка
buyGiftBtn.addEventListener('click', ()=>{
    let selected = document.querySelector('.gift.selected');
    if(!selected) return;
    let index = Array.from(giftsGrid.children).indexOf(selected);
    let gift = gifts[index];
    if(balance < gift.value){ alert('Недостаточно средств'); return; }
    balance -= gift.value;
    document.getElementById('balanceLabel').innerText = balance.toFixed(1)+' TON';
    addGiftToInventory(gift);
    buyGiftBtn.disabled = true;
    selected.classList.remove('selected');
    betModal.classList.add('hidden');
    Telegram.WebApp.sendData(JSON.stringify({action:'buyGift',gift:gift}));
});
updateInventory();

// =================== Кейсы ===================
let standardGifts = [
    {name