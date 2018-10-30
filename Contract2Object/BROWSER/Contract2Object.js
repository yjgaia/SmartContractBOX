global.Contract2Object = CLASS((cls) => {
	
	let isWeb3Enable = false;
	
	// Web3 체크
	if (typeof global.web3 !== 'undefined') {
		global.web3 = new Web3(global.web3.currentProvider);
		isWeb3Enable = true;
	}
	
	let checkIsWeb3Enable = cls.checkIsWeb3Enable = () => {
		return isWeb3Enable;
	};
	
	// 결과를 정돈합니다.
	let cleanResult = (outputs, result) => {
		
		// output이 없는 경우
		if (outputs.length === 0) {
			return undefined;
		}
		
		// output이 1개인 경우
		else if (outputs.length === 1) {
			
			let type = outputs[0].type;
			
			// 숫자인 경우
			if (result.toNumber !== undefined) {
				return {
					value : result.toNumber(),
					str : result.toString(10)
				};
			}
			
			// 배열인 경우
			else if (type.substring(type.length - 2) === '[]') {
				
				let array = [];
				let strArray = [];
				EACH(result, (value, i) => {
					if (value.toNumber !== undefined) {
						array.push(value.toNumber());
						strArray.push(value.toString(10));
					} else {
						array.push(value);
						strArray.push(String(value));
					}
				});
				
				return {
					value : array,
					str : strArray
				};
			}
			
			// 기타
			else {
				return {
					value : result,
					str : String(result)
				};
			}
		}
		
		// output이 여러개인 경우
		else if (outputs.length > 1) {
			
			let resultArray = [];
			
			EACH(outputs, (output, i) => {
				
				let type = output.type;
				
				// 숫자인 경우
				if (result[i].toNumber !== undefined) {
					resultArray.push(result[i].toNumber());
				}
				
				// 배열인 경우
				else if (type.substring(type.length - 2) === '[]') {
					
					let array = [];
					EACH(result[i], (value, j) => {
						if (value.toNumber !== undefined) {
							array.push(value.toNumber());
						} else {
							array.push(value);
						}
					});
					
					resultArray.push(array);
				}
				
				// 기타
				else {
					resultArray.push(result[i]);
				}
			});
			
			EACH(outputs, (output, i) => {
				
				let type = output.type;
				
				// 숫자인 경우
				if (result[i].toNumber !== undefined) {
					resultArray.push(result[i].toString(10));
				}
				
				// 배열인 경우
				else if (type.substring(type.length - 2) === '[]') {
					
					let strArray = [];
					EACH(result[i], (value, j) => {
						if (value.toNumber !== undefined) {
							strArray.push(value.toString(10));
						} else {
							strArray.push(String(value));
						}
					});
					
					resultArray.push(strArray);
				}
				
				// 기타
				else {
					resultArray.push(String(result[i]));
				}
			});
			
			return {
				array : resultArray
			};
		}
	};
	
	return {
		
		init : (inner, self, params) => {
			//REQUIRED: params
			//REQUIRED: params.abi
			//REQUIRED: params.address
			
			let abi = params.abi;
			let address = params.address;
			
			let getAddress = self.getAddress = () => {
				return address;
			};
			
			let eventMap = {};
			
			let contract;
			if (checkIsWeb3Enable() === true) {
				
				contract = web3.eth.contract(abi).at(address);
				
				// 계약의 이벤트 핸들링
				contract.allEvents((error, info) => {
					
					if (error === TO_DELETE) {
						
						let eventHandlers = eventMap[info.event];
						
						if (eventHandlers !== undefined) {
							EACH(eventHandlers, (eventHandler) => {
								eventHandler(info.args);
							});
						}
					}
				});
				
				// 함수 분석 및 생성
				EACH(abi, (funcInfo) => {
					if (funcInfo.type === 'function') {
						
						self[funcInfo.name] = (params, callbackOrHandlers) => {
							
							// 콜백만 입력된 경우
							if (callbackOrHandlers === undefined) {
								callbackOrHandlers = params;
								params = undefined;
							}
							
							let callback;
							let transactionAddressCallback;
							let errorHandler;
							
							// 콜백 정리
							if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
								callback = callbackOrHandlers;
							} else {
								callback = callbackOrHandlers.success;
								transactionAddressCallback = callbackOrHandlers.transactionAddress;
								errorHandler = callbackOrHandlers.error;
							}
							
							let args = [];
							
							// 파라미터가 없거나 1개인 경우
							if (funcInfo.payable !== true && funcInfo.inputs.length <= 1) {
								args.push(params);
							}
							
							// 파라미터가 여러개인 경우
							else {
								
								let paramsArray = [];
								EACH(params, (param) => {
									paramsArray.push(param);
								});
								
								EACH(funcInfo.inputs, (input, i) => {
									if (input.name !== '') {
										args.push(params[input.name]);
									} else {
										args.push(paramsArray[i]);
									}
								});
							}
							
							// 이더 추가
							if (funcInfo.payable === true) {
								args.push({
									value : web3.toWei(params.ether, 'ether')
								});
							}
							
							// 콜백 추가
							args.push((error, result) => {
								
								// 계약 실행 오류 발생
								if (error !== TO_DELETE) {
									if (errorHandler !== undefined) {
										errorHandler(error.toString());
									} else {
										SHOW_ERROR(funcInfo.name, error.toString(), params);
									}
								}
								
								// 정상 작동
								else {
									
									// constant 함수인 경우
									if (funcInfo.constant === true) {
										
										if (callback !== undefined) {
											
											// output이 없는 경우
											if (funcInfo.outputs.length === 0) {
												callback();
											}
											
											// output이 1개인 경우
											else if (funcInfo.outputs.length === 1) {
												result = cleanResult(funcInfo.outputs, result);
												callback(result.value, result.str);
											}
											
											// output이 여러개인 경우
											else if (funcInfo.outputs.length > 1) {
												result = cleanResult(funcInfo.outputs, result);
												callback.apply(TO_DELETE, result.array);
											}
										}
									}
									
									// 트랜잭션이 필요한 함수인 경우
									else {
										
										if (transactionAddressCallback !== undefined) {
											transactionAddressCallback(result);
										}
										
										if (callback !== undefined) {
											
											let retry = RAR(() => {
												
												web3.eth.getTransactionReceipt(result, (error, result) => {
													
													// 트랜잭선 오류 발생
													if (error !== TO_DELETE) {
														if (errorHandler !== undefined) {
															errorHandler(error.toString());
														} else {
															SHOW_ERROR(funcInfo.name, error.toString(), params);
														}
													}
													
													// 아무런 값이 없으면 재시도
													else if (result === TO_DELETE || result.blockHash === TO_DELETE) {
														retry();
													}
													
													// 트랜잭션 완료
													else {
														callback();
													}
												});
											});
										}
									}
								}
							});
							
							contract[funcInfo.name].apply(contract, args);
						};
					}
				});
			}
			
			// UPPERCASE-ROOM 기능을 사용하여 클라이언트에서 web3를 지원하지 않더라도 서버를 통해 정보를 받아오도록 합니다.
			else if (global.UPPERCASE !== undefined && UPPERCASE.ROOM !== undefined) {
				
				let room = UPPERCASE.ROOM('__Contract2Object/' + address);
				
				// 함수 분석 및 생성
				EACH(abi, (funcInfo) => {
					if (funcInfo.type === 'function') {
						
						self[funcInfo.name] = (params, callbackOrHandlers) => {
							
							// 콜백만 입력된 경우
							if (callbackOrHandlers === undefined) {
								callbackOrHandlers = params;
								params = undefined;
							}
							
							let callback;
							let transactionAddressCallback;
							let errorHandler;
							
							// 콜백 정리
							if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
								callback = callbackOrHandlers;
							} else {
								callback = callbackOrHandlers.success;
								transactionAddressCallback = callbackOrHandlers.transactionAddress;
								errorHandler = callbackOrHandlers.error;
							}
							
							let args = [];
							
							// 파라미터가 없거나 1개인 경우
							if (funcInfo.payable !== true && funcInfo.inputs.length <= 1) {
								args.push(params);
							}
							
							// 파라미터가 여러개인 경우
							else {
								
								let paramsArray = [];
								EACH(params, (param) => {
									paramsArray.push(param);
								});
								
								EACH(funcInfo.inputs, (input, i) => {
									if (input.name !== '') {
										args.push(params[input.name]);
									} else {
										args.push(paramsArray[i]);
									}
								});
							}
							
							// 이더 추가
							if (funcInfo.payable === true) {
								args.push(web3.toWei(params.ether, 'ether'));
							}
							
							// 콜백 추가
							args.push();
							
							room.send({
								methodName : funcInfo.name,
								data : params
							}, (result) => {
								
								// constant 함수인 경우
								if (funcInfo.constant === true) {
									
									if (callback !== undefined) {
										
										// output이 없는 경우
										if (funcInfo.outputs.length === 0) {
											callback();
										}
										
										// output이 1개인 경우
										else if (funcInfo.outputs.length === 1) {
											callback(result.value, result.str);
										}
										
										// output이 여러개인 경우
										else if (funcInfo.outputs.length > 1) {
											callback.apply(TO_DELETE, result.array);
										}
									}
								}
								
								// 트랜잭션이 필요한 함수인 경우
								else {
									// 실행 불가
								}
							});
						};
					}
				});
			}
			
			// 이벤트 핸들러를 등록합니다.
			let on = self.on = (eventName, eventHandler) => {
				//REQUIRED: eventName
				//REQUIRED: eventHandler
				
				if (eventMap[eventName] === undefined) {
					eventMap[eventName] = [];
				}
	
				eventMap[eventName].push(eventHandler);
			};
			
			// 이벤트 핸들러를 제거합니다.
			let off = self.off = (eventName, eventHandler) => {
				//REQUIRED: eventName
				//OPTIONAL: eventHandler
	
				if (eventMap[eventName] !== undefined) {
	
					if (eventHandler !== undefined) {
	
						REMOVE({
							array: eventMap[eventName],
							value: eventHandler
						});
					}
	
					if (eventHandler === undefined || eventMap[eventName].length === 0) {
						delete eventMap[eventName];
					}
				}
			};
		}
	};
});