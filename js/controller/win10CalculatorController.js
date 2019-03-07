/*jshint esversion: 6 */
/*jshint -W061 */
class Win10CalculatorController {
	constructor(){
		this._memoryData		= '';
		this._memoryHistory		= [];
		this._memoryOnOff		= false;
		this._audio 			= new Audio('./audio/beep.wav');
		this._audioOnOff 		= false;
		this._lastOperator 		= '';
		this._lastResult 		= '';
		this._operation 		= [];
		this._locale 			= 'pt-BR';
		this._displayCalcEl 	= document.querySelector("#display");
		this._displayHistEl 	= document.querySelector("#displayHistory");
		this.initialize();
		this.initButtonsEvents();
		this.initKeyboard();
	}
	initialize(){
		this.toggleMemory();
		
		document.querySelectorAll('.btn-others').forEach(btn => {
			if (btn.textContent == 'CE') {
				btn.addEventListener('dblclick', e => {
					this.toggleAudio();
				});
			}
		});
	}
	initButtonsEvents(){
		let buttons = document.querySelectorAll(".btn-number, .btn-others, .btn-memory");

		buttons.forEach((btn, index) => {
			// btn.addEventListener('click', e => {
			this.addEventListenerAll(btn, 'onmouserover mouseup mousedown', e => {
				btn.style.cursor = "pointer";
			});
			this.addEventListenerAll(btn, 'click drag', e => {
				let textBtn = btn.textContent;
				this.execBtn(textBtn);
			});
		});
	}
	initKeyboard(){
		document.addEventListener('keyup', e => {
			this.playAudio();
			// console.warn('e.code: ' + e.code.slice(0, 6) + ' e.key: ' + e.key);
			switch (e.key) {
				case 'Escape':
					this.clearAll();
					this.execBtnHover('C');
					break;
				case 'Backspace':
					if (e.ctrlKey) {
						this.clearEntry();
						this.execBtnHover('CE');
					} else {
						this.clearLastChar();
						this.execBtnHover('←');
					}
					break;
				case '√':
				case 'x²':
				case '¹/x':
					break;
				case '*':
				case 'x':
					this.addOperation('*');
					this.execBtnHover('x');
					break;
				case '/':
				case '÷':
					this.addOperation('/');
					this.execBtnHover('÷');
					break;
				case '%':
				case '-':
				case '+':
					this.addOperation(e.key);
					this.execBtnHover(e.key);
					break;
				case 'Enter':
				case '=':
					this.calcTotal();
					setTimeout(() => {
						this.clearResult();
					}, 1);
					this.execBtnHover('=');
					break;
				case ',':
					this.addDot();
					this.execBtnHover(e.key);
					break;
				case '±':
					this.changePositiveNegative();
					break;
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					this.addOperation(parseFloat(e.key));
					this.execBtnHover(e.key);
					break;
				case 'Numlock':
				case 'Home':
				case 'PageUp':
				case 'PageDown':
				case 'Clear':
				case 'Insert':
				case 'Delete':
				case 'ArrowUp':
				case 'ArrowRight':
				case 'ArrowDown':
				case 'ArrowLeft':
					this.setError('NUMLOCK INACTIVE');
					break;
			}
		});
	}
	toggleMemory() {
		if (this._memoryOnOff){		
			this._memoryOnOff = false;
			$('#MC').removeAttr('disabled', 'disabled');
			$('#MR').removeAttr('disabled', 'disabled');
			$('#Mˇ').removeAttr('disabled', 'disabled');
		} else {
			this._memoryOnOff = true;
			$('#MC').attr('disabled', 'disabled');
			$('#MR').attr('disabled', 'disabled');
			$('#Mˇ').attr('disabled', 'disabled');
		}
	}
	memoryClearAll(){
		this._memoryData = '';
		this._memoryHistory = [];
		this._memoryOnOff = false;
		this.toggleMemory();
		this.setMessage('Memory has been cleared!');
		this.clearMessage();
	}
	memoryRecall(){
		let valueDisplay = this._memoryData;
		this.displayCalc = valueDisplay;
		this._memoryHistory.push(this._memoryData); 
		this.setMessage('Value has been recalled from memory');
		this.clearMessage();		
	}
	memoryAdding(){
		let valueDisplay = this.displayCalc;
		let valueMem = (this._memoryData) ? this._memoryData : 0;
		let value = eval(`(${valueDisplay} + ${valueMem})`);
		this._memoryData = parseFloat(value);
		this._memoryHistory.push(valueMem); 
		if(this._memoryOnOff == true) this.toggleMemory();
		this.setMessage('Value has been added in memory');
		this.clearMessage();
	}
	memorySubtracting(){
		let valueDisplay = this.displayCalc;
		let valueMem = (this._memoryData) ? this._memoryData : 0;
		let value = eval(`(${valueMem} - ${valueDisplay})`);
		this._memoryData = parseFloat(value);
		this._memoryHistory.push(value);
		if (this._memoryOnOff == true) this.toggleMemory();
		this.setMessage('Value has been stored in memory');
		this.clearMessage();		
	}
	memoryStore(){
		let valueDisplay = this.displayCalc;
		this._memoryData = parseFloat(valueDisplay);
		this._memoryHistory.push(valueDisplay);
		if (this._memoryOnOff == true) this.toggleMemory();
		this.setMessage('Value has been stored in memory');
		this.clearMessage();
	}
	memoryHistoric(){}
	addEventListenerAll(element, events, fn) {
		events.split(' ').forEach(event => {
			element.addEventListener(event, fn, false);
		});
	}
	clearAll() {
		this._operation = [];
		this._lastOperator = '';
		this._lastResult = '';
		this.setLastNumberToDisplay();
		this._displayCalcEl.style.fontSize = '46px';
	}
	clearResult() {
		this._lastOperator = '';
		this._lastResult = '';
		this.setLastNumberToDisplay();
		this._operation = [];
		this._displayCalcEl.style.fontSize = '46px';
	}
	clearEntry() {
		this._operation.pop();
		this.setLastNumberToDisplay();
		this._displayCalcEl.style.fontSize = '46px';
	}
	clearLastChar(){
		let nStr = this.getLastOperation();
		if (nStr) {
			nStr = nStr.slice(0, -1);
		} else {
			nStr = "";
		}
	
		this.setLastOperation(nStr);
		this.setLastNumberToDisplay();
	}
	changePositiveNegative() {
		let nStr = this.getLastOperation();
		nStr = eval(`(${nStr - (nStr * 2)})`);
		this.setLastOperation(nStr);
		this.setLastNumberToDisplay();
	}
	setError(value) {
		this.displayCalc = 'ERROR';
		this.displayHistory = value;
	}
	setMessage(msg) {
		this.displayHistory = msg;
	}
	clearMessage() {
		setTimeout(() => {
			this.displayHistory = '';
		}, 2000);
	}
	toggleAudio() {
		if (this._audioOnOff) {
			this.playAudio();
			this._audioOnOff = false;
			this.displayHistory = 'AUDIO OFF';
		} else {
			this._audioOnOff = true;
			this.displayHistory = 'AUDIO ON';
			this.playAudio();
		}
	}
	playAudio() {
		if (this._audioOnOff) {
			this._audio.currentTime = 0;
			this._audio.play();
		}
	}
	getLastOperation() {
		return this._operation[this._operation.length - 1];
	}
	setLastOperation(value) {
		this._operation[this._operation.length - 1] = value;
	}
	isOperator(value) {
		return (['+', '-', '*', '%', '/', '√', 'x²', '¹/x'].indexOf(value) > -1);
	}
	pushOperation(value) {
		this._operation.push(value);
		if (this._operation.length > 3) {
			this.calcTotal();
		}
	}
	getResult() {
		try {
			return eval(this._operation.join(''));
		} catch (e) {
			setTimeout(() => {
				this.setError();
			}, 1);
		}
	}
	calcMathFunction(){
		let result 	 = 0;
		let number 	 = this.getLastItem(false);
		let operator = this.getLastItem();

		if (this._operation.length == 2 && operator == '%') {
			result = eval(`(${(number/100)})`);
			result = parseFloat(result.toFixed(5));
			this._operation = [result];
			this.setLastNumberToDisplay();
		} else if (this._operation.length == 2 && operator == '√') {
			result = eval(`(${Math.sqrt(number)})`);
			result = parseFloat(result.toFixed(5));
			this._operation = [result];
			this.setLastNumberToDisplay();
		} else if (this._operation.length == 2 && operator == 'x²') {
			result = eval(`(${Math.pow(number, 2)})`);
			result = parseFloat(result.toFixed(5));
			this._operation = [result];
			this.setLastNumberToDisplay();
		} else if (this._operation.length == 2 && operator == '¹/x') {
			result = eval(`(${(1/number)})`);
			result = parseFloat(result.toFixed(5));
			this._operation = [result];
			this.setLastNumberToDisplay();
		}
	}
	calcTotal() {
		let last = '';
		let result = 0;
		
		this._lastOperator = this.getLastItem();

		if (this._operation.length < 3) {
			let firstItem = this._operation[0];
			this._operation = [firstItem, this._lastOperator, this._lastResult];
		}

		if (this._operation.length > 3) {
			last = this._operation.pop();
			this._lastResult = this.getResult();
		} else if (this._operation.length == 3) {
			this._lastResult = this.getLastItem(false);
		}

		if (this.getResult()) {
			result = this.getResult();
		}

		let firstNumber = this._operation[0];
		let operator = this._operation[1];
		let lastNumber = this._operation[2];
		
		if (last == '%') {
			result = eval(`${firstNumber} ${operator} (${(firstNumber/100)*lastNumber})`);
			result = parseFloat(result.toFixed(5));
			this._operation = [result];
			this.setLastNumberToDisplay();
		} else if (last == '√') {
			result = eval(`${firstNumber} ${operator} (${Math.sqrt(lastNumber)})`);
			result = parseFloat(result.toFixed(5));
			this._operation = [result];
			this.setLastNumberToDisplay();
		} else if (last == 'x²') {
			result = eval(`${firstNumber} ${operator} (${Math.pow(lastNumber, 2)})`);
			result = parseFloat(result.toFixed(5));
			this._operation = [result];
			this.setLastNumberToDisplay();
		} else if (last == '¹/x') {
			result = eval(`${firstNumber} ${operator} (${(1/lastNumber)})`);
			result = parseFloat(result.toFixed(5));
			this._operation = [result];
			this.setLastNumberToDisplay();
		} else {
			result = parseFloat(result.toFixed(5));
			this._operation = [result];
			if (last) this._operation.push(last);
			this.setLastNumberToDisplay();
		}
	}
	getLastItem(isOperator = true) {
		let lastItem;

		for (let i = this._operation.length - 1; i >= 0; i--) {
			if (this.isOperator(this._operation[i]) == isOperator) {
				lastItem = this._operation[i];
				break;
			}
		}

		if (!lastItem) {
			lastItem = (isOperator) ? this._lastOperator : this._lastResult;
		}

		return lastItem;
	}
	setLastNumberToDisplay() {
		let lastNumber = this.getLastItem(false);

		this.displayHistory = this._operation.join(' ');

		if (lastNumber && (this._operation.length > 0)) {
			this.displayCalc = lastNumber;
		} else {
			this.displayCalc = '0';
		}
	}
	addOperation(value) {
		if (isNaN(this.getLastOperation())) {
			// string
			if (this.isOperator(value)) {
				this.setLastOperation(value);
			} else {
				this.pushOperation(value);
				this.setLastNumberToDisplay();
			}
		} else {
			// number
			if (this.isOperator(value) && value != '%' && value != '√' && value != 'x²' && value != '¹/x') {
				this.pushOperation(value);
				this.setLastNumberToDisplay();
			} else if (this.isOperator(value) && value == '%' || value == '√' || value == 'x²' || value == '¹/x') {
				this.pushOperation(value);
				this.calcMathFunction();
				this.setLastNumberToDisplay();
			} else {
				let newValue = this.getLastOperation().toString() + value.toString();
				this.setLastOperation(newValue);
				this.setLastNumberToDisplay();
			}
		}
	}
	execBtn(value) {
		this.playAudio();
		
		switch (value) {
			case 'MC':
				this.memoryClearAll();
				break;
			case 'MR':
				this.memoryRecall();
				break;
			case 'M+':
				this.memoryAdding();
				break;
			case 'M-':
				this.memorySubtracting();
				break;
			case 'MS':
				this.memoryStore();
				break;
			case 'Mˇ':
				this.memoryHistoric();
				break;
			case 'C':
				this.clearAll();
				break;
			case 'CE':
				this.clearEntry();
				break;
			case '%':
			case '-':
			case '+':
			case '√':
			case 'x²':
			case '¹/x':
				this.addOperation(value);
				break;
			case '÷':
				this.addOperation('/');
				break;
			case 'x':
				this.addOperation('*');
				break;
			case '=':
				this.calcTotal();
				setTimeout(() => {
					this.clearResult();
				}, 1);
				break;
			case ',':
				this.addDot();
				break;
			case '←':
				this.clearLastChar();
				break;
			case '±':
				this.changePositiveNegative();
				break;
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
			this.addOperation(parseFloat(value));
			break;
			default:
			this.setError();
			break;
		}
	}
	execBtnHover(key) {
		let buttons = document.querySelectorAll(".btn-number, .btn-others, .btn-memory");

		buttons.forEach((btn, index) => {
			if (btn.textContent == key) 
				document.getElementById(key).style.backgroundColor = '#BCBCBC';
				setTimeout(() => {
					document.getElementById(key).style.backgroundColor = '';
				}, 200);
				
		});
	}
	addDot() {
		let lastOperation = this.getLastOperation();
	
		if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

		if (this.isOperator(lastOperation) || !lastOperation) {
			this.pushOperation('0.');
		} else {
			this.setLastOperation(lastOperation.toString() + '.');

		}
		this.setLastNumberToDisplay();
	}
	addComma(nStr) {
		nStr += '';
		let x = nStr.split('.');
		let x1 = x[0];
		let x2 = x.length > 1 ? ',' + x[1] : '';
		let rgx = /(\d+)(\d{3})/;

		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + '.' + '$2');
		}

		return x1 + x2;
	}
	// getters and setters
	get displayCalc() {
		return this._displayCalcEl.innerHTML;
	}
	set displayCalc(value) {
		if (value.toString().length == 11) {
			this._displayCalcEl.style.fontSize = '42px';
		} else if (value.toString().length == 12) {
			this._displayCalcEl.style.fontSize = '38px';
		} else if (value.toString().length == 13) {
			this._displayCalcEl.style.fontSize = '34px';
		} else if (value.toString().length == 14) {
			this._displayCalcEl.style.fontSize = '30px';
		} else if (value.toString().length == 15) {
			this._displayCalcEl.style.fontSize = '26px';
		} else if (value.toString().length >= 16) {
			value = parseFloat(value);
			value = value.toExponential(4);
			this._displayCalcEl.style.fontSize = '46px';
		}
		
		value = this.addComma(value);
		this._displayCalcEl.innerHTML = value;
	}
	get displayHistory() {
		return this._displayHistEl.innerHTML;
	}
	set displayHistory(value) {
		this._displayHistEl.innerHTML = value;
	}
}