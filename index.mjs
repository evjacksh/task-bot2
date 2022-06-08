import TelegramApi from 'node-telegram-bot-api'
import axios from 'axios'
import FormData from 'form-data'
import http from 'http'
const token = '5313280359:AAGlHJST4liN8RI2si_yEPFaCl8pTm8tmx0'
const bot = new TelegramApi(token, {polling: true})


// Server
const requestListener = (req,res) => {
    if(req.url === '/meet'){
        req.on('data', chunk => {
            const serverData = JSON.parse(chunk)
            const {chat_id, meet_username} = serverData
            const message = `Ваша встреча с ${meet_username} начнется через 15 минут!`
            bot.sendMessage(chat_id, message)
            res.writeHead(200)
            res.end('Connection OK, status: 200')
        })
    } else{
        req.on('data', () => {
            res.writeHead(200)
            res.end('Connection OK, but this link have nothing to return')
        })
    }
}
const server = http.createServer(requestListener)
server.listen(5432, 'localhost')


// RegularExp
    // Stat RegularExp
        const statRegularExp = /=((([А-Я]{1,10}[1,9]{1,3})((\*)[0-9]{1,10}){4})|(([А-Я]{1,10})(\*)[0-9]{1,10}))$/

    // Meet RegularExp
        const meetRegularExp = /((@((([A-z])|[0-9])+)) (([0-9]{1,2}\.){2})([0-9]{4}) ([0-9]{1,2}:[0-9]{1,2}$))/
        const meetUsernameRegularExp = /(@((([A-z])|[0-9])+))/
        const meetDateRegularExp = /(([0-9]{1,2}\.){2})([0-9]{4})/
        const meetTimeRegularExp = /([0-9]{1,2}:[0-9]{1,2})$/


const POST_FETCH_REQUEST = async (form) => {
    
    const URL = 'https://t.multibrand.msk.ru/tg_bot.php'

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
        }
    }

    axios.post(URL, form, options)
        .then(res => console.log(res.data))
        .catch(err => console.log(err))
}

// const GET_FETCH_REQUEST = async (chat_id) => {
//     const URL = `https://t.multibrand.msk.ru/tg_bot.php?stat`

//     let data
//     axios.get(URL)
//         .then(res => res.json())
//         .then(json => console.log(json))
//         .catch(err => console.log(err))
//     return data
// }



const formatCheck = (text,Regexp) => text.match(Regexp) ? text.match(Regexp)[0] : null

const onBugs = async (chatId) => {
    await bot.sendMessage(chatId, `Письмо об ошибке,должно быть описано в одном сообщении,включая прикрепленные файлы.

Опишите некорректную работу платформы,по возможности,прикрепите фото/видео-материалы и отправляйте сообщение.

Если вы все сделали верно, бот пришлет сообщение с соотвествующим контекстом.
            `)

    return bot.once('message', async msg => {
        const {first_name,username} = msg.from
        let {text} = msg

        const form = new FormData()
        form.append('command_type', 'bug')
        form.append('chat_id', chatId)
        form.append('user_text', text)
        form.append('username', username)
        form.append('first_name', first_name)

        await POST_FETCH_REQUEST(form)
        return bot.sendMessage(chatId, `Спасибо за проявленную инициативность! В ближайшее время ошибка будет исправлена :)`)
    })   
}

const onUpgrade = async (chatId) => {
    await bot.sendMessage(chatId, `Письмо об улучшении,должно быть описано в одном сообщении,включая прикрепленные файлы.

Опишите свою идею,по возможности,прикрепите фото/видео-материалы, в качестве референсов и отправляйте сообщение.

Если вы все сделали верно, бот пришлет сообщение с соотвествующим контекстом.
            `)

   return bot.once('message', async msg => {
        const {first_name,username} = msg.from
        let {text} = msg

        const form = new FormData()
        form.append('command_type', 'upg')
        form.append('chat_id', chatId)
        form.append('user_text', text)
        form.append('username', username)
        form.append('first_name', first_name)

        await POST_FETCH_REQUEST(form)
        return bot.sendMessage(chatId, `Спасибо за проявленную инициативность! В ближайшее время мы рассмотрим ваше предложение :)`)
    })   
}

const onStat = async (chatId) => {
    await bot.sendMessage(chatId, `Чтобы успешно записать отчет вам обязательно нужно придерживаться заданного стандарта.
На данный момент существует два варианта записи отчета: полный и быстрый.

Полный выглядит так: =СПБ1*17000*7222*17*3

Быстрый выглядит так: =СПБ*21873302
    `)

    return bot.once('message', async msg => {
        const {first_name,username} = msg.from
        let {text} = msg

        if(formatCheck(text,statRegularExp) !== null){
            const form = new FormData()
            form.append('command_type', 'stat')
            form.append('chat_id', chatId)
            form.append('user_text', text)
            form.append('username', username)
            form.append('first_name', first_name)

            await POST_FETCH_REQUEST(form)
            return  bot.sendMessage(chatId, 'Отчет отправлен :)')
        } else{
            return bot.sendMessage(chatId, `Отчет не отправлен. 
Убедитесь,что придерживались заданного стандарта`)
        }
    })
}

const onMeet = async (chatId) => {
    // const {last_meet, most_frequently_meet} = GET_FETCH_REQUEST()
    const meetMessage = `Чтобы назначить встречу следуйте инструкции.
    
Для начала выберите,с кем вы хотите назначить встречу?
`

    const user_meet_options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {text: 'Сережа', callback_data: '@olimp360'},
                    {text: 'Женя', callback_data: '@evjacksh'}, 
                    {text: 'Рома', callback_data: '@Memoriz1337'}, 
                    {text: 'Коля', callback_data: '@nikemat'}, 
                    {text: 'Тимур', callback_data: '@Ttimbaland'}, 
                ],

            ]
        })
    }

    const meet_date_options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {text: '01', callback_data: '01'},
                    {text: '02', callback_data: '02'}, 
                    {text: '03', callback_data: '03'}, 
                    {text: '04', callback_data: '04'}, 
                    {text: '05', callback_data: '05'}, 
                    {text: '06', callback_data: '06'}, 
                    {text: '07', callback_data: '07'}, 
                ],
                [
                    {text: '08', callback_data: '08'},
                    {text: '09', callback_data: '09'}, 
                    {text: '10', callback_data: '10'}, 
                    {text: '11', callback_data: '11'}, 
                    {text: '12', callback_data: '12'}, 
                    {text: '13', callback_data: '13'}, 
                    {text: '14', callback_data: '14'}, 
                ],
                [
                    {text: '15', callback_data: '16'},
                    {text: '17', callback_data: '17'}, 
                    {text: '18', callback_data: '18'}, 
                    {text: '19', callback_data: '19'}, 
                    {text: '20', callback_data: '20'}, 
                    {text: '21', callback_data: '21'}, 
                    {text: '22', callback_data: '22'}, 
                ],
                [
                    {text: '23', callback_data: '23'},
                    {text: '24', callback_data: '24'}, 
                    {text: '25', callback_data: '25'}, 
                    {text: '26', callback_data: '26'}, 
                    {text: '27', callback_data: '27'}, 
                    {text: '28', callback_data: '28'}, 
                    {text: '29', callback_data: '29'}, 
                ],
                [
                    {text: '30', callback_data: '30'},
                    {text: '31', callback_data: '30'}, 
                ],

            ]
        })
    }

    const meet_time_options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {text: '09:00', callback_data: '09:00'},
                    {text: '10:00', callback_data: '10:00'}, 
                    {text: '11:00', callback_data: '11:00'}, 
                    {text: '12:00', callback_data: '12:00'}, 
                    {text: '13:00', callback_data: '13:00'}, 
                    {text: '14:00', callback_data: '14:00'}, 
                    {text: '15:00', callback_data: '15:00'}, 
                ],
                [
                    {text: '16:00', callback_data: '16:00'},
                    {text: '17:00', callback_data: '17:00'}, 
                    {text: '18:00', callback_data: '18:00'}, 
                    {text: '19:00', callback_data: '19:00'}, 
                ],
            ]
        })
    }

    await bot.sendMessage(chatId, meetMessage, user_meet_options)

    bot.once('callback_query', async callback_query => {
        const action = callback_query.data
        const {message_id} = callback_query.message
        const {username,first_name} = callback_query.from
        let meet_username = action
        await bot.editMessageText('Теперь выберите дату', Object.assign(meet_date_options,{message_id,chat_id:chatId}))

        bot.once('callback_query',async callback_query => {
            const action = callback_query.data
            let meet_date = action
            await bot.editMessageText('Теперь выберите время', Object.assign(meet_time_options,{message_id,chat_id:chatId}))

            return bot.once('callback_query',async callback_query => {
                const action = callback_query.data
                let meet_time = action

                if(meet_username !== null & meet_date !== null & meet_time !== null ){
                    const now_date = new Date()
                    const meetDate = new Date(`${meet_date}.${now_date.getMonth() + 1}.${now_date.getFullYear()} ${meet_time}`).getTime() / 1000
                    const form = new FormData()
                    form.append('command_type', 'meet')
                    form.append('chat_id', chatId)
                    form.append('username', username)
                    form.append('first_name', first_name)
                    form.append('meet_date', meetDate)
                    form.append('meet_username', meet_username)
        
                    await POST_FETCH_REQUEST(form)
                    return bot.editMessageText(`Встреча с ${meet_username} назначена ${meet_date} числа в ${meet_time} :)`,{message_id,chat_id:chatId})
                } else{
                    return bot.editMessageText('Встреча не назначена. Убедитесь,что сделали все правильно',{message_id,chat_id:chatId})
                }
            })
        })
    })

}

const start = () => {

    bot.setMyCommands([
        {command: '/start', description: 'Запустить бота'},
        {command: '/bug', description: 'Сообщить об обнаруженной недоработке'},
        {command: '/upg', description: 'Предложить идею по дополнению функционала'},
        {command: '/stat', description: 'Написать отчет'},
        {command: '/meet', description: 'Назначить встречу'},
    ])

    const startOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Сообщить о баге', callback_data: '/bug'}],
                [{text: 'Сделать предложение', callback_data: '/upg'}],
                [{text: 'Отправить отчет', callback_data: '/stat'}],
                [{text: 'Назначить встречу', callback_data: '/meet'}],
            ]
        })
    }

    bot.on('message', async msg => {
        const chatId = msg.chat.id
        const {username} = msg.chat
        const {text,message_id} = msg


        console.log(msg)
        if(text === '/start'){

            // bot.sendMessage(chatId, 'Если вы покажите свой номер телефона боту,мы сможем подсказать вам статус вашего заказа', {
            //     reply_markup: {
            //         one_time_keyboard: true,
            //         keyboard: [[{text: 'Показать боту свой номер', request_contact: true, one_time_keyboard: true}]]
            //     }
            // })

            const startMessage = `В этого бота можно отправлять замеченные вами недоработки, предложения по улучшению функционала той платформы, с которой вы работаете, отправлять отчеты по эффективности рекламе, назначать встречи.
            
            Чтобы это сделать, вам для начала нужно выбрать нужный пункт в меню или нажать на кнопку с соотвествующим названием и отправить информацию в соотвествии с инструкцией в сообщении,появившемся после нажатия на кнопку.
            
            Либо же ввести одну из команд: 
            /bug - в случае,если вы нашли недоработку. 
            /upg - в случае,если вы хотите что-нибудь предложить.
            /stat - в случае,если вы хотите отправить отчет по рекламе.
            /meet - в случае,если вы хотите назначить встречу.
                        `
            const form = new FormData()
            form.append('command_type', 'start')
            form.append('chat_id', chatId)
            form.append('username', username)
    
            await POST_FETCH_REQUEST(form)
            await bot.sendMessage(chatId, startMessage ,startOptions)

            return bot.on('callback_query', async callback_query => {
                const action = callback_query.data

                if(action === '/bug') return onBugs(chatId)
                if(action === '/upg') return onUpgrade(chatId)
                if(action === '/stat') return onStat(chatId)
                if(action === '/meet') return onMeet(chatId)
            })
        }

        if(text === '/bug'){
            return onBugs(chatId)
        }

        if(text === '/upg'){
            return onUpgrade(chatId)
        }

        if(text === '/stat'){
            return onStat(chatId)
        }

        if(text === '/meet'){
            return onMeet(chatId)
        }
    })
  
}

start()

