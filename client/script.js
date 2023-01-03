import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
console.log(chatContainer);


let loadInterval;

function loader(element){
    element.textContent= '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if(element.textContent === '....'){
            element.textContent = '';
        }
    }, 300)
}

function typeText(element, text){
    let index = 0;
    let interval = setInterval(() => {
        if(index < text.length){
            element.innerHTML += text.charAt(index)
            index++;
        } else{
            clearInterval(interval);
        }

    }, 15);
}

function generateUniqueId(){
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatColor(isAi, value, uniqueId){
    return(
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const submitForm = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    // cor da mensagem do usuario
    chatContainer.innerHTML += chatColor(false, data.get('prompt'))

    // limpar a área do form
    form.reset()

    // cor da mensagem do bot
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatColor(true, " ", uniqueId)

    // focar o scroll até em baixo
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // especifica a div da mensagem
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    //pegar a resposta do server.js
    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if(response.ok){
        const data = await response.json();
        const parsedData = data.bot.trim();
        
        typeText(messageDiv, parsedData);
    } else{
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong"
        alert(err);
    }

}

form.addEventListener('submit', submitForm);
form.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        submitForm(e);
    }
});

