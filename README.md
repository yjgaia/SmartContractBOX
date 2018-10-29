# Contract2Object
스마트 계약의 ABI와 [UPPERCASE의 OOP 기능](https://github.com/Hanul/UPPERCASE/blob/master/DOC/GUIDE/OOP.md)을 이용하여 스마트 계약을 JavaScript 객체로 만들어 줍니다.

## 사용 방법
```javascript
SomeContract = OBJECT({
	preset : () => {
		return Contract2Object;
	},
	params : () => {
		return {
			abi : [{"constant":true,"inputs":...,
			address : '0x031Fa6bE087416386ab6b85fE97A0856164821c2'
		};
	}
});
```

## 사용 예시
- [RankCoin](https://rankcoin.net/) - https://github.com/Hanul/RankCoin/blob/master/js/RankCoinContract.js

## 라이센스
[MIT](LICENSE)

## 작성자
[Young Jae Sim](https://github.com/Hanul)
