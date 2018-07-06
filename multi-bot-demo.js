(() => {
	//
	// GLOBAL VARS AND CONFIGS
	//
	var lastMessageOnChat = false;
	var ignoreLastMsg = {};
	var elementConfig = {
		"chats": [1, 0, 5, 2, 0, 3, 0, 0, 0],
		"chat_icons": [0, 0, 1, 1, 1, 0],
		"chat_title": [0, 0, 1, 0, 0, 0, 0],
		"chat_lastmsg": [0, 0, 1, 1, 0, 0],
		"chat_active": [0, 0],
		"selected_title": [1, 0, 5, 3, 0, 1, 1, 0, 0, 0]
	};

	const jokeList = [
		`
		Husband and Wife had a Fight.
		Wife called Mom : He fought with me again,
		I am coming to you.
		Mom : No beta, he must pay for his mistake,
		I am comming to stay with U!`,

		`
		Husband: Darling, years ago u had a figure like Coke bottle.
		Wife: Yes darling I still do, only difference is earlier it was 300ml now it's 1.5 ltr.`,

		`
		God created the earth,
		God created the woods,
		God created you too,
		But then, even God makes mistakes sometimes!`,

		`
		What is a difference between a Kiss, a Car and a Monkey?
		A kiss is so dear, a car is too dear and a monkey is U dear.`
	]


	//
	// FUNCTIONS
	//

	// Get random value between a range
	function rand(high, low = 0) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	}
	
	function getElement(id, parent){
		if (!elementConfig[id]){
			return false;
		}
		var elem = !parent ? document.body : parent;
		var elementArr = elementConfig[id];
		for (var x in elementArr){
			var pos = elementArr[x];
			if (isNaN(pos*1)){ //dont know why, but for some reason after the last position it loops once again and "pos" is loaded with a function WTF. I got tired finding why and did this
				continue;
			}
			if (!elem.childNodes[pos]){
				return false;
			}
			elem = elem.childNodes[pos];
		}
		return elem;
	}
	
	function getLastMsg(){
		var messages = document.querySelectorAll('.msg');
		var pos = messages.length-1;
		
		while (messages[pos] && (messages[pos].classList.contains('msg-system') || messages[pos].querySelector('.message-out'))){
			pos--;
			if (pos <= -1){
				return false;
			}
		}
		if (messages[pos] && messages[pos].querySelector('.selectable-text')){
			return messages[pos].querySelector('.selectable-text').innerText;
		} else {
			return false;
		}
	}
	
	function getUnreadChats(){
		var unreadchats = [];
		var chats = getElement("chats");
		if (chats){
			chats = chats.childNodes;
			for (var i in chats){
				if (!(chats[i] instanceof Element)){
					continue;
				}
				var icons = getElement("chat_icons", chats[i]).childNodes;
				if (!icons){
					continue;
				}
				for (var j in icons){
					if (icons[j] instanceof Element){
						if (!(icons[j].childNodes[0].getAttribute('data-icon') == 'muted' || icons[j].childNodes[0].getAttribute('data-icon') == 'pinned')){
							unreadchats.push(chats[i]);
							break;
						}
					}
				}
			}
		}
		return unreadchats;
	}
	
	function didYouSendLastMsg(){
		var messages = document.querySelectorAll('.msg');
		if (messages.length <= 0){
			return false;
		}
		var pos = messages.length-1;
		
		while (messages[pos] && messages[pos].classList.contains('msg-system')){
			pos--;
			if (pos <= -1){
				return -1;
			}
		}
		if (messages[pos].querySelector('.message-out')){
			return true;
		}
		return false;
	}

	// Call the main function again
	const goAgain = (fn, sec) => {
		// const chat = document.querySelector('div.chat:not(.unread)')
		// selectChat(chat)
		setTimeout(fn, sec * 1000)
	}

	// Dispath an event (of click, por instance)
	const eventFire = (el, etype) => {
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent(etype, true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
		el.dispatchEvent(evt);
	}

	// Select a chat to show the main box
  const selectChat = (chat, cb) => {
		const title = getElement("chat_title",chat).title;
		eventFire(chat.firstChild.firstChild, 'mousedown');
		if (!cb) return;
		const loopFewTimes = () => {
			setTimeout(() => {
				const titleMain = getElement("selected_title") .firstChild.title;
				if (titleMain !== undefined && titleMain != title){
					console.log('not yet');
					return loopFewTimes();
				}
				return cb();
			}, 300);
		}

		loopFewTimes();
	}

	// Send a message
	const sendMessage = (chat, message, cb) => {
		//avoid duplicate sending
		var title;

		if (chat){
			title = getElement("chat_title",chat).title;
		} else {
			title = getElement("selected_title").title;
		}
		ignoreLastMsg[title] = message;
		
		messageBox = document.querySelectorAll("[contenteditable='true']")[0];

		//add text into input field
		messageBox.innerHTML = message.replace(/  /gm,'');

		//Force refresh
		event = document.createEvent("UIEvents");
		event.initUIEvent("input", true, true, window, 1);
		messageBox.dispatchEvent(event);

		//Click at Send Button
		eventFire(document.querySelector('span[data-icon="send"]'), 'click');

		cb();
	}

	//
	// MAIN LOGIC
	//
	const start = (_chats, cnt = 0) => {
		// get next unread chat
		const chats = _chats || getUnreadChats();
		const chat = chats[cnt];
		
		var processLastMsgOnChat = false;
		var lastMsg;
		
		if (!lastMessageOnChat){
			if (false === (lastMessageOnChat = getLastMsg())){
				lastMessageOnChat = true; //to prevent the first "if" to go true everytime
			} else {
				lastMsg = lastMessageOnChat;
			}
		} else if (lastMessageOnChat != getLastMsg() && getLastMsg() !== false && !didYouSendLastMsg()){
			lastMessageOnChat = lastMsg = getLastMsg();
			processLastMsgOnChat = true;
		}
		
		if (!processLastMsgOnChat && (chats.length == 0 || !chat)) {
			console.log(new Date(), 'nothing to do now... (1)', chats.length, chat);
			return goAgain(start, 3);
		}

		// get infos
		var title;
		if (!processLastMsgOnChat){
			title = getElement("chat_title",chat).title + '';
			lastMsg = (getElement("chat_lastmsg", chat) || { innerText: '' }).innerText; //.last-msg returns null when some user is typing a message to me
		} else {
			title = getElement("selected_title").title;
		}
		// avoid sending duplicate messaegs
		if (ignoreLastMsg[title] && (ignoreLastMsg[title]) == lastMsg) {
			console.log(new Date(), 'nothing to do now... (2)', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		// what to answer back?
		let sendText

    // beggining of customization
    
    // BOT COOPERAPAS CLIENTS AND PROVIDERS

    		if (lastMsg.toUpperCase().indexOf('@COOPEBOT') > -1){
			sendText = `
				Olá! Aqui quem fala é o assistente da COOPERAPAS. Você pode interagir comigo por aqui. Envie *COOPEBOT* para entender como eu posso te ajudar.
				
Você é cliente?
Envie *PEDIR* para realizar seu pedido.

É fornecedor?
Envie *RECEBER* para receber pedidos de clientes assim que eles chegarem.

_Não se esqueça de sempre colocar o sinal *@* antes de suas mensagens. Por exemplo: *@resposta*. Assim eu consigo entender e te responder._`
		}		
		
		// clients
		
			if (lastMsg.toUpperCase().indexOf('@PEDIR') > -1){
			sendText = `
				Ok! Envie para mim o seu pedido no seguinte formato:
				
QTD	UND	PRODUTO
10 mç agrião (talo grosso)
10 kg mandioca s/ casca emb à vácuo 500gr
        
        Em seguida, envie *FECHAR* para concluir seu pedido.
        
        _Não se esqueça de colocar o sinal *@* antes de sua resposta. Por exemplo: *@resposta*. Assim eu consigo entender._
				`
		}
		
      if (lastMsg.toUpperCase().indexOf('@FECHAR') > -1){
      sendText = `
      Ok! Seu pedido já está em análise, obrigado!`
      }
	
	// providers
	
      if (lastMsg.toUpperCase().indexOf('@RECEBER') > -1){
      sendText = `
      	Ok, a partir de agora você receberá alertas de pedidos.
      	
      	Para o dia de hoje, já temos estes pedidos:
      	
      	QTD	UND	PRODUTO
        10 mç agrião (talo grosso)
        10 kg mandioca s/ casca emb à vácuo 500gr
      	
      	Envie PROPOSTA para enviar sua proposta para este pedido.
      	
      	_Use o sinal *@* antes de sua resposta. Por exemplo: *@resposta*. Assim eu consigo entender e te responder._`
      }
      
      if (lastMsg.toUpperCase().indexOf('@PROPOSTA') > -1){
      sendText = `OK! Envie sue proposta como no exemplo abaixo:
      
        QTD	UND	PRODUTO	PREÇO UNITÁRIO
        30	KG	ABACATE	R$5,00 
        10,5	KG	ABÓBORA JERIMUM R$4,00 
      
        Para encerrar, envie FINALIZAR.
        `
      }
      
           if (lastMsg.toUpperCase().indexOf('@FINALIZAr') > -1){
      sendText = `Obrigado! Sua proposta já está sendo avaliada.`
      }
		

    // BOT FARMERS

		if (lastMsg.toUpperCase().indexOf('@LIGUEBOT') > -1){
			sendText = `
			Olá! Aqui quem fala é o assistente do Ligue os Pontos da Prefeitura de São Paulo. Envie a qualquer momento *LIGUEBOT* para entender como eu posso te ajudar.
		
Estes são os comandos que você pode enviar para mim:
				
*VISITA*
Agende uma visita de um técnico da Prefeitura.
*CURSOS*
Tem interesse em se desenvolver? Envie para saber dos cursos disponíveis.
*MATERIAIS*
Está precisando de material para sua plantação? Envie para participar de compras com desconto. 
        
_Não se esqueça de sempre colocar o sinal *@* antes de suas mensagens. Por exemplo: *@resposta*. Assim eu consigo entender e te responder._`
		}
		
		// visita
		
		if (lastMsg.toUpperCase().indexOf('@VISITA') > -1){
			sendText = `
	      Vamos agendar uma visita até a sua propriedade! Qual o seu dia e horário preferido?
        
        *SEGUNDA*
        *QUARTA*
        *SEXTA*
        
        _Não se esqueça de utilizar o símbolo @ antes da sua resposta. Exemplo: @diadasemana._`
		}
		
		if (lastMsg.toUpperCase().indexOf('@SEGUNDA') > -1){
			sendText = `
				Ok! Entendemos o dia que você prefere. E qual período?
        *MANHÃ*
        *TARDE*
        *NOITE*
        
        _Não se esqueça de utilizar o símbolo @ antes da sua resposta. Exemplo: @período._`
		}
		
		if (lastMsg.toUpperCase().indexOf('@QUARTA') > -1){
	sendText = `
		Ok! Entendemos o dia que você prefere. E qual período?
    *MANHÃ*
    *TARDE*
    *NOITE*
    
    _Não se esqueça de utilizar o símbolo @ antes da sua resposta. Exemplo: @período._`
}

		if (lastMsg.toUpperCase().indexOf('@SEXTA') > -1){
	sendText = `
		Ok! Entendemos o dia que você prefere. E qual período?
    *MANHÃ*
    *TARDE*
    *NOITE*
    
    _Não se esqueça de utilizar o símbolo @ antes da sua resposta. Exemplo: @período._`
}
		
		if (lastMsg.toUpperCase().indexOf('@MANHÃ') > -1){
			sendText = `
				Obrigado! Sua visita está sendo agendada por nossos técnicos e já iremos confirmá-la.`
		}
		
		if (lastMsg.toUpperCase().indexOf('@MANHA') > -1){
			sendText = `
				Obrigado! Sua visita está sendo agendada por nossos técnicos e já iremos confirmá-la.`
		}
		
		if (lastMsg.toUpperCase().indexOf('@TARDE') > -1){
		sendText = `
			Obrigado! Sua visita está sendo agendada por nossos técnicos e já iremos confirmá-la.`
	  }
		
		if (lastMsg.toUpperCase().indexOf('@NOITE') > -1){
		sendText = `
			Obrigado! Sua visita está sendo agendada por nossos técnicos e já iremos confirmá-la.`
  	}
		
		// cursos
		
		if (lastMsg.toUpperCase().indexOf('@CURSOS') > -1){
			sendText = `
        Você tem interesse em se desenvolver? Veja alguns cursos que temos disponível logo abaixo. É só responder com o nome dele:
        
        *CURSO1*
        *CURSO2*
        *CURSO3*
        
        _Não se esqueça de utilizar o símbolo @ antes da sua resposta. Exemplo: @curso._`
		}
		
		if (lastMsg.toUpperCase().indexOf('@CURSO1') > -1){
	sendText = `
    Obrigado pela resposta! Vamos entrar em contato com você para agendar este curso.`
    }
    
    if (lastMsg.toUpperCase().indexOf('@CURSO2') > -1){
	sendText = `
    Obrigado pela resposta! Vamos entrar em contato com você para agendar este curso.`
    }
    
    if (lastMsg.toUpperCase().indexOf('@CURSO3') > -1){
	sendText = `
    Obrigado pela resposta! Vamos entrar em contato com você para agendar este curso.`
    }
		
		// materiais
		
		if (lastMsg.toUpperCase().indexOf('@MATERIAIS') > -1){  
			sendText = `
				Você está precisando de material para sua produção? Estamos organizando compras com vários agricultores assim os custos podem ser menores para todos!
        
        O que você precisa comprar?
        
        *ADUBO*
        *FERTILIZANTES*
        *PESTICIDAS*
        
        _Não se esqueça de utilizar o símbolo @ antes da sua resposta. Exemplo: @produto._`
		}
		
		if (lastMsg.toUpperCase().indexOf('@MATERIAIS') > -1){  
			sendText = `
				Você está precisando de material para sua produção? Estamos organizando compras com vários agricultores assim os custos podem ser menores para todos!
        
        O que você precisa comprar?
        
        *ADUBO*
        *FERTILIZANTES*
        *PESTICIDAS*
        
        _Não se esqueça de utilizar o símbolo @ antes da sua resposta. Exemplo: @produto._`
		}
		
		if (lastMsg.toUpperCase().indexOf('@ADUBO') > -1){  
			sendText = `Ok! Recebemos seu pedido.`
		}
		
		if (lastMsg.toUpperCase().indexOf('@FERTILIZANTES') > -1){  
	    sendText = `Ok! Recebemos seu pedido!`
  }
		
		if (lastMsg.toUpperCase().indexOf('@PESTICIDAS') > -1){  
	    sendText = `Ok! Recebemos seu pedido!`
  }
		
		// end of customization

		if (lastMsg.toUpperCase().indexOf('@JOKE') > -1){
			sendText = jokeList[rand(jokeList.length - 1)];
		}
		
		// that's sad, there's not to send back...
		if (!sendText) {
			ignoreLastMsg[title] = lastMsg;
			console.log(new Date(), 'new message ignored -> ', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		console.log(new Date(), 'new message to process, uhull -> ', title, lastMsg);

		// select chat and send message
		if (!processLastMsgOnChat){
			selectChat(chat, () => {
				sendMessage(chat, sendText.trim(), () => {
					goAgain(() => { start(chats, cnt + 1) }, 0.1);
				});
			})
		} else {
			sendMessage(null, sendText.trim(), () => {
				goAgain(() => { start(chats, cnt + 1) }, 0.1);
			});
		}
	}
	start();
})()
