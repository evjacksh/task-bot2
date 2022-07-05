import TelegramApi from 'node-telegram-bot-api'
import axios from 'axios'
import FormData from 'form-data'
import http from 'http'
const token = '5269030142:AAHIxx6SQx3Q5M2IvV2w6xwFIGW7vmvB7Dg'
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




const onStart = async (chatId,first_name,username,message_id) => {

    const startOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Узнать стоимость ремонта', callback_data: '/price'}],
                [{text: 'Получить консультацию', callback_data: '/manager'}],
                [{text: 'Отправить фото на оценку', callback_data: '/photo'}],
                [{text: 'Посмотреть контакты', callback_data: '/contacts'}],
                [{text: 'Оставить отзыв', callback_data: '/feedback'}],
            ]
        })
    }
    
    // bot.sendMessage(chatId, 'Если вы покажите свой номер телефона боту,мы сможем подсказать вам статус вашего заказа', {
    //     reply_markup: {
    //         one_time_keyboard: true,
    //         keyboard: [[{text: 'Показать боту свой номер', request_contact: true, one_time_keyboard: true}]]
    //     }
    // })

    const startMessage = `${first_name}, доброго времени суток. Что вас интересует? `
    const form = new FormData()
    form.append('command_type', 'start')
    form.append('chat_id', chatId)
    form.append('username', username)
    form.append('first_name', first_name)

    await POST_FETCH_REQUEST(form)
    const mes = await bot.sendMessage(chatId, startMessage ,startOptions)
    

    return bot.on('callback_query', async callback_query => {
        const action = callback_query.data

        if(action === '/price') {
            await bot.deleteMessage(chatId,mes.message_id)
            return onBugs(chatId)
        }
        if(action === '/contacts') {
            await bot.deleteMessage(chatId,mes.message_id)
            return onUpgrade(chatId)
        }
        if(action === '/manager'){
            await bot.deleteMessage(chatId,mes.message_id)
            return onMeet(chatId)
        }
        if(action === '/photo'){
            bot.deleteMessage(chatId,mes.message_id)
            return onSendImage(chatId)
        }
        if(action === '/feedback'){
            bot.deleteMessage(chatId,mes.message_id)
            return onFeedback(chatId)
        }
        
    })

}

const onBackToStart = async (chatId,first_name,username,message_id) => {

    const startOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Узнать стоимость ремонта', callback_data: '/price'}],
                [{text: 'Получить консультацию', callback_data: '/manager'}],
                [{text: 'Отправить фото на оценку', callback_data: '/photo'}],
                [{text: 'Посмотреть контакты', callback_data: '/contacts'}],
            ]
        })
    }

    // bot.sendMessage(chatId, 'Если вы покажите свой номер телефона боту,мы сможем подсказать вам статус вашего заказа', {
    //     reply_markup: {
    //         one_time_keyboard: true,
    //         keyboard: [[{text: 'Показать боту свой номер', request_contact: true, one_time_keyboard: true}]]
    //     }
    // })

    const startMessage = `Что вас интересует? `
    const form = new FormData()
    form.append('command_type', 'backtostart')
    form.append('chat_id', chatId)
    form.append('username', username)
    form.append('first_name', first_name)

    await POST_FETCH_REQUEST(form)
    const mes = await bot.sendMessage(chatId, startMessage ,startOptions)

    await bot.on('message', async msg => {
        const chatId = msg.chat.id
        const {username,first_name} = msg.chat
        const {text,message_id} = msg


        console.log(msg)
        if(text === '/start'){
            return onStart(chatId,first_name,username,message_id)
        }

        if(text === '/price'){
            bot.deleteMessage(chatId,message_id)
            return onBugs(chatId)
        }

        if(text === '/contacts'){
            bot.deleteMessage(chatId,message_id)
            return onUpgrade(chatId)
        }

        if(text === '/manager'){
            bot.deleteMessage(chatId,message_id)
            return onMeet(chatId)
        }
        if(text === '/photo'){
            bot.deleteMessage(chatId,message_id)
            return onSendImage(chatId)
        }
    })

    await bot.on('callback_query', async callback_query => {
        const action = callback_query.data

        if(action === '/price') {
            await bot.deleteMessage(chatId,mes.message_id)
            return onBugs(chatId)
        }
        if(action === '/contacts') {
            await bot.deleteMessage(chatId,mes.message_id)
            return onUpgrade(chatId)
        }
        if(action === '/manager'){
            await bot.deleteMessage(chatId,mes.message_id)
            return onMeet(chatId)
        }
        if(action === '/photo'){
            bot.deleteMessage(chatId,mes.message_id)
            return onSendImage(chatId)
        }
    })
}

const onBugs = async (chatId) => {
    const product_type_keyboard = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {text: 'Смартфон', callback_data: 'smartphone'}, 
                    {text: 'Телевизор', callback_data: 'tv'}, 
                ],
                [
                    {text: 'Ноутбук', callback_data: 'laptop'},
                    {text: 'Проектор', callback_data: 'projector'},
                    {text: 'Камера', callback_data: 'camera'}, 
                ],
                [
                    {text: 'Квадрокоптер', callback_data: 'quadrocopter'}, 
                    {text: 'Самокат', callback_data: 'scooter'}, 
                ],
            ]
        })
    }

    const back_to_menu_keyboard = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {text: 'Получить консультацию', callback_data: '/meet'}, 
                ],
                [
                    {text: 'Вернуться в начало', callback_data: '/start'},
                ]
            ]
        }),
        parse_mode: 'Markdown'
    } 

    const tv_price_text = `
    *Ремонт телевизора*
- Замена экрана 1320 руб. 
- Замена разъёма 950 руб. 
- Замена блока питания 850 руб. 
[Смотреть весь прайс](https://techsupport.com.ru/remont-televizorov/#telegram)
    `
    const laptop_price_text = `
    *Ремонт ноутбука*
- Замена дисплея 1060 руб. 
- Ремонт клавиатуры 650 руб. 
- Замена аккумулятора 450 руб.
[Смотреть весь прайс](https://techsupport.com.ru/remont-noutbukov/#telegram)
        `
    const smartphone_price_text = `
    *Ремонт смартфона*
- Замена стекла 1650 руб.
- Замена экрана 1400 руб. 
- Замена аккумулятора 600 руб.
[Смотреть весь прайс](https://techsupport.com.ru/remont-smartfonov/#telegram)
    `
    const projector_price_text =  `
    *Ремонт прожектора*
- ремонт в данном виде техники индивидуален и может быть рассчитан по запросу. 
Опишите проблему и инженер сориентирует по стоимости и срокам ремонта.
- стандартный ремонт укладывается в 900 рублей.
        `
    const camera_price_text =  `
    *Ремонт камеры*
- ремонт в данном виде техники индивидуален и может быть рассчитан по запросу. 
Опишите проблему и инженер сориентирует по стоимости и срокам ремонта.
- стандартный ремонт укладывается в 900 рублей.
        `
    const quadrocopter_price_text =  `
    *Ремонт квадрокоптера*
- Диагностика детальная от 450 руб.
    
- Замена камеры от 500 руб. 
    
- Замена аккумулятора от 500 руб.
        `
    const scooter_price_text =  `
    *Ремонт самоката*
- Замена аккумулятора от 500 руб. 
    
- Замена контроллера от 700 руб. 
    
- Замена светодиода / индикатора от 500 руб.
        `

    await bot.sendMessage(chatId, `Выберите тип устройства`, product_type_keyboard)

    return bot.once('callback_query', async callback_query => {
        const action = callback_query.data
        const {message_id} = callback_query.message
        const {username,first_name} = callback_query.from

        if(action === 'laptop'){
            const product_type = action
            await bot.deleteMessage(chatId,message_id)
            await bot.sendPhoto(chatId,'https://techsupport.com.ru/img/3-note.jpg',Object.assign(back_to_menu_keyboard,{caption:laptop_price_text}))
            return bot.once('callback_query', async callback_query => {
                const action = callback_query.data
                const {message_id} = callback_query.message
                
                const form = new FormData()
                form.append('command_type', `price ${product_type}`)
                form.append('chat_id', chatId)
                form.append('user_text', action)
                form.append('username', username)
                form.append('first_name', first_name)
        
                await POST_FETCH_REQUEST(form)

                if(action === '/start'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onBackToStart(chatId,first_name,username)
                }
                if(action === '/meet'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onMeet(chatId)
                }
            
            })
        }
        if(action === 'smartphone'){
            const product_type = action
            await bot.deleteMessage(chatId,message_id)
            await bot.sendPhoto(chatId,'https://techsupport.com.ru/img/2-smart.jpg',Object.assign(back_to_menu_keyboard,{caption:smartphone_price_text}))
            return bot.once('callback_query', async callback_query => {
                const action = callback_query.data
                const {message_id} = callback_query.message
                
               
                const form = new FormData()
                form.append('command_type', `price ${product_type}`)
                form.append('chat_id', chatId)
                form.append('user_text', action)
                form.append('username', username)
                form.append('first_name', first_name)
        
                await POST_FETCH_REQUEST(form)

                if(action === '/start'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onBackToStart(chatId,first_name,username)
                }
                if(action === '/meet'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onMeet(chatId)
                }
            })
        }
        if(action === 'tv'){
            const product_type = action
            await bot.deleteMessage(chatId,message_id)
            await bot.sendPhoto(chatId,'https://techsupport.com.ru/img/1-tv.jpg',Object.assign(back_to_menu_keyboard,{caption:tv_price_text}))
            return bot.once('callback_query', async callback_query => {
                const action = callback_query.data
                const {message_id} = callback_query.message

                const form = new FormData()
                form.append('command_type', `price ${product_type}`)
                form.append('chat_id', chatId)
                form.append('user_text', action)
                form.append('username', username)
                form.append('first_name', first_name)
        
                await POST_FETCH_REQUEST(form)

                if(action === '/start'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onBackToStart(chatId,first_name,username)
                }
                if(action === '/meet'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onMeet(chatId)
                }
            
            })
        }
        if(action === 'projector'){
            const product_type = action
            await bot.deleteMessage(chatId,message_id)
            await bot.sendPhoto(chatId,'./img/pro.jpg',Object.assign(back_to_menu_keyboard,{caption:projector_price_text}))
            return bot.once('callback_query', async callback_query => {
                const action = callback_query.data
                const {message_id} = callback_query.message

                const form = new FormData()
                form.append('command_type', `price ${product_type}`)
                form.append('chat_id', chatId)
                form.append('user_text', action)
                form.append('username', username)
                form.append('first_name', first_name)
        
                await POST_FETCH_REQUEST(form)

                if(action === '/start'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onBackToStart(chatId,first_name,username)
                }
                if(action === '/meet'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onMeet(chatId)
                }
            
            })
        }
        if(action === 'camera'){
            const product_type = action
            await bot.deleteMessage(chatId,message_id)
            await bot.sendPhoto(chatId,'./img/camera.jpg',Object.assign(back_to_menu_keyboard,{caption:camera_price_text}))
            return bot.once('callback_query', async callback_query => {
                const action = callback_query.data
                const {message_id} = callback_query.message

                const form = new FormData()
                form.append('command_type', `price ${product_type}`)
                form.append('chat_id', chatId)
                form.append('user_text', action)
                form.append('username', username)
                form.append('first_name', first_name)
        
                await POST_FETCH_REQUEST(form)

                if(action === '/start'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onBackToStart(chatId,first_name,username)
                }
                if(action === '/meet'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onMeet(chatId)
                }
            
            })
        }
        if(action === 'quadrocopter'){
            const product_type = action
            await bot.deleteMessage(chatId,message_id)
            await bot.sendPhoto(chatId,'./img/quadro.jpg',Object.assign(back_to_menu_keyboard,{caption:quadrocopter_price_text}))
            return bot.once('callback_query', async callback_query => {
                const action = callback_query.data
                const {message_id} = callback_query.message

                const form = new FormData()
                form.append('command_type', `price ${product_type}`)
                form.append('chat_id', chatId)
                form.append('user_text', action)
                form.append('username', username)
                form.append('first_name', first_name)
        
                await POST_FETCH_REQUEST(form)

                if(action === '/start'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onBackToStart(chatId,first_name,username)
                }
                if(action === '/meet'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onMeet(chatId)
                }
            
            })
        }
        if(action === 'scooter'){
            const product_type = action
            await bot.deleteMessage(chatId,message_id)
            await bot.sendPhoto(chatId,'./img/scooter.jpg',Object.assign(back_to_menu_keyboard,{caption:scooter_price_text}))
            return bot.once('callback_query', async callback_query => {
                const action = callback_query.data
                const {message_id} = callback_query.message

                const form = new FormData()
                form.append('command_type', `price ${product_type}`)
                form.append('chat_id', chatId)
                form.append('user_text', action)
                form.append('username', username)
                form.append('first_name', first_name)
        
                await POST_FETCH_REQUEST(form)

                if(action === '/start'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onBackToStart(chatId,first_name,username)
                }
                if(action === '/meet'){
                    bot.removeAllListeners()
                    bot.deleteMessage(chatId,message_id)
                    return onMeet(chatId)
                }
            
            })
        }
    }) 
}

const onUpgrade = async (chatId) => {
    const back_to_menu_keyboard = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {text: 'Получить консультацию', callback_data: '/meet'},
                ],
                [
                    {text: 'Вернуться в начало', callback_data: '/start'},
                ]
            ]
        }),
        parse_mode: 'Markdown'
    } 

    const text = `
*Контакты сервисного центра TECHSUPPORT*
г. Москва, ул. Фадеева, 7
ст. м. Белорусская / Маяковская / Новослободская

Часы работы сервиса:
Ежедневно с 10:00 до 20:00

Позвоните нам прямо сейчас:
[+7 (499) 229-85-77](tel:74992298577)
                `
    await bot.sendPhoto(chatId,'https://techsupport.com.ru/img/0-contacts.jpg',Object.assign(back_to_menu_keyboard,{caption:text}))
    return bot.once('callback_query', async callback_query => {
        const action = callback_query.data
        const {username, first_name} = callback_query.from
        const {message_id} = callback_query.message

        const form = new FormData()
        form.append('command_type', 'contacts')
        form.append('chat_id', chatId)
        form.append('user_text', action)
        form.append('username', username)
        form.append('first_name', first_name)

        await POST_FETCH_REQUEST(form)

        if(action === '/start'){
            bot.removeAllListeners()
            bot.deleteMessage(chatId,message_id)
            return onBackToStart(chatId,first_name,username)
        }
        if(action === '/meet'){
            bot.removeAllListeners()
            bot.deleteMessage(chatId,message_id)
            return onMeet(chatId)
        }
    
    })

}

const onMeet = async (chatId) => {
    const meetMessage = `Выберите устройство`

    const product_type_keyboard = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {text: 'Смартфон', callback_data: 'smartphone'}, 
                    {text: 'Телевизор', callback_data: 'tv'}, 
                ],
                [
                    {text: 'Ноутбук', callback_data: 'laptop'},
                    {text: 'Проектор', callback_data: 'projector'},
                    {text: 'Камера', callback_data: 'camera'}, 
                ],
                [
                    {text: 'Квадрокоптер', callback_data: 'quadrocopter'}, 
                    {text: 'Скутер', callback_data: 'scooter'}, 
                ],
            ]
        })
    }

    const meet_type_keyboard = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {text: 'По звонку', callback_data: 'call'}, 
                ],
                [
                    {text: 'В сообщении', callback_data: 'msg'},
                ]
            ]
        })
    }

    const back_to_menu_keyboard = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {text: 'Вернуться в начало', callback_data: '/start'},
                ]
            ]
        }),
        parse_mode: 'Markdown'
    } 

    await bot.sendMessage(chatId, meetMessage, product_type_keyboard)

    bot.once('callback_query', async callback_query => {
        const device_type = callback_query.data
        const {message_id} = callback_query.message
        const {username,first_name} = callback_query.from
        
        await bot.editMessageText('Опишите вашу проблему в одном сообщении',{message_id,chat_id:chatId})
        return bot.once('message', async (msg) => {
            const ms_id = msg.message_id
            const user_text = msg.text
            await bot.deleteMessage(chatId, ms_id)
            await bot.editMessageText(`Спасибо за обращение. 
Как вам удобно получить консультацию?`,Object.assign(meet_type_keyboard,{message_id,chat_id:chatId}))

            return bot.once('callback_query', async callback_query => {
                const action = callback_query.data
                const form = new FormData()
                form.append('chat_id', chatId)
                form.append('user_text', user_text)
                form.append('username', username)
                form.append('first_name', first_name)

                if(action === 'call'){
                    await bot.editMessageText('На какой номер перезвонить нашему сервисному инженеру для обсуждения неисправности вашего устройства и вариантов ремонта?',{message_id,chat_id:chatId})
                    return bot.once('message', async msg => {
                        const ms_id = msg.message_id
                        const user_phone = msg.text
                        await bot.editMessageText(`
Спасибо! 
Наш сервисный инженер оценит неисправность и скоро свяжется с вами!`,Object.assign(back_to_menu_keyboard,{message_id,chat_id:chatId}))
                        await bot.deleteMessage(chatId,ms_id)
                        form.append('command_type', `price ${action} ${device_type} ${user_phone}`)
                        await POST_FETCH_REQUEST(form)
                        return bot.once('callback_query', async callback_query => {
                            const action = callback_query.data 
                            if(action === '/start'){
                                try {
                                    await bot.deleteMessage(chatId,message_id)
                                } catch (error) {
                                    console.log(error);
                                }
                                await bot.removeAllListeners()
                                return onBackToStart(chatId,first_name,username)
                            }
                        })
                    })
                }
                if(action === 'msg'){
                    form.append('command_type', `price ${action} ${device_type}`)
                    await POST_FETCH_REQUEST(form)
                    await bot.editMessageText(`
Спасибо! 
Наш сервисный инженер оценит неисправность и скоро свяжется с вами!`,Object.assign(back_to_menu_keyboard,{message_id,chat_id:chatId}))
                    return bot.once('callback_query', async callback_query => {
                        const action = callback_query.data 
                        if(action === '/start'){
                            try {
                                await bot.deleteMessage(chatId,message_id)
                            } catch (error) {
                                console.log(error);
                            }
                            await bot.removeAllListeners()
                            return onBackToStart(chatId,first_name,username)
                        }
                    })
                }
            })
        })
    })

}

const onSendImage = async (chatId) => {
    const sendImageText = 'Выберите 1 фото, которое максимально отражает поломку вашего устройства.'
    const back_to_menu_keyboard = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {text: 'Вернуться в начало', callback_data: '/start'},
                ]
            ]
        }),
        parse_mode: 'Markdown'
    }

    const meet_type_keyboard = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [
                    {text: 'По звонку', callback_data: 'call'}, 
                ],
                [
                    {text: 'В сообщении', callback_data: 'msg'},
                ]
            ]
        })
    }

    const botMsg = await bot.sendMessage(chatId, sendImageText)
    return bot.once('message', async msg => {
        const {first_name,username} = msg.from
        let text = msg.caption ? msg.caption : msg.text
        let photo = msg.photo ? msg.photo[msg.photo.length - 1].file_id : null
        let ms_id = msg.message_id
        let message_id = botMsg.message_id
        let textWithImg = ''


        const asyncFucn = async () => {
            const axiosGet = async () => {
                const res = await axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${photo}`)
                let resString = res.data.result.file_path
                let count = resString.match(/[0-9]+/)
                return resString.replace(count,++count)
            }
            const data = await axiosGet()
            textWithImg += `https://api.telegram.org/bot${token}/getFile?file_id=${photo}
            
https://api.telegram.org/file/bot${token}/${data}`


            const form = new FormData()

            form.append('chat_id', chatId)

            if(photo !== null){
                form.append('user_text', textWithImg)
            } else{
                form.append('user_text', text)
            }

            form.append('username', username)
            form.append('first_name', first_name)

            await bot.deleteMessage(chatId, ms_id)
            await bot.editMessageText(`Фото направлено нашему сервисному инженеру. 
Как вам удобно получить консультацию?`,Object.assign(meet_type_keyboard,{message_id,chat_id:chatId}))
            return bot.once('callback_query', async callback_query => {
                const action = callback_query.data 


                if(action === 'call'){
                    await bot.editMessageText('На какой номер перезвонить нашему сервисному инженеру для обсуждения неисправности вашего устройства и вариантов ремонта?',{message_id,chat_id:chatId})
                    return bot.once('message', async msg => {
                        const ms_id = msg.message_id
                        const user_phone = msg.text
                        form.append('command_type', `send_defect_photo ${action} ${user_phone}`)
                        await POST_FETCH_REQUEST(form)
                        await bot.deleteMessage(chatId,ms_id)
                        await bot.editMessageText(`
    Спасибо! 
Наш сервисный инженер оценит неисправность и скоро свяжется с вами!`,Object.assign(back_to_menu_keyboard,{message_id,chat_id:chatId}))
                        return bot.once('callback_query', async callback_query => {
                            const action = callback_query.data 
                            if(action === '/start'){
                                try {
                                    await bot.deleteMessage(chatId,message_id)
                                } catch (error) {
                                    console.log(error);
                                }
                                await bot.removeAllListeners()
                                return onBackToStart(chatId,first_name,username)
                            }
                        })
                    })
                }
                if(action === 'msg'){
                    form.append('command_type', `send_defect_photo ${action}`)
                    await POST_FETCH_REQUEST(form)
                    await bot.editMessageText(`
    Спасибо! 
    Наш сервисный инженер оценит неисправность и скоро свяжется с вами!`,Object.assign(back_to_menu_keyboard,{message_id,chat_id:chatId}))
                    return bot.once('callback_query', async callback_query => {
                        const action = callback_query.data 
                        if(action === '/start'){
                            try {
                                await bot.deleteMessage(chatId,message_id)
                            } catch (error) {
                                console.log(error);
                            }
                            await bot.removeAllListeners()
                            return onBackToStart(chatId,first_name,username)
                        }
                    })
                }
            })
        }
        asyncFucn()
    })    
}

const onFeedback = async (chatId) => {
    const startMsg = `Расскажите свою историю и как вам помогли в нашем сервисе. Чтобы это сделать отправьте сообщение в этот чат.`


    await bot.sendMessage(chatId, startMsg)
    return bot.once('message', async msg => {
        const {first_name,username} = msg.from
        const text = msg.text
        

        const form = new FormData()
        form.append('command_type', 'contacts')
        form.append('chat_id', chatId)
        form.append('user_text', text)
        form.append('username', username)
        form.append('first_name', first_name)

        await POST_FETCH_REQUEST(form)
    })
}

const start = () => {
    bot.removeAllListeners()

    bot.setMyCommands([
        {command: '/start', description: 'Запустить бота'},
        {command: '/price', description: 'Узнать стоимость'},
        {command: '/manager', description: 'Получить консультацию'},
        {command: '/photo', description: 'Отправить фото на оценку'},
        {command: '/contacts', description: 'Посмотреть контакты'},
        {command: '/feedback', description: 'Оставить отзыв'},
    ])

    bot.on('message', async msg => {
        const chatId = msg.chat.id
        const {username,first_name} = msg.chat
        const {text,message_id} = msg


        console.log(msg)
        if(text === '/start'){
            return onStart(chatId,first_name,username,message_id)
        }

        if(text === '/price'){
            bot.deleteMessage(chatId,message_id)
            return onBugs(chatId)
        }

        if(text === '/contacts'){
            bot.deleteMessage(chatId,message_id)
            return onUpgrade(chatId)
        }

        if(text === '/manager'){
            bot.deleteMessage(chatId,message_id)
            return onMeet(chatId)
        }
        if(text === '/photo'){
            bot.deleteMessage(chatId,message_id)
            return onSendImage(chatId)
        }
        if(text === '/feedback'){
            bot.deleteMessage(chatId,message_id)
            return onFeedback(chatId)
        }
    })
}

start()

