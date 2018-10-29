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

예를 들어 스마트 계약에 다음과 같은 함수가 있다면,
```solidity
function balanceOf(address user) external view returns (uint256 balance) {
	return balances[user];
}
```

다음과 같이 JavaScript 함수로 사용할 수 있습니다.
```javascript
SomeContract.balancOf(user, (balance) => {
	...
});
```

너무 큰 숫자의 경우 JavaScript의 숫자 타입으로는 범위가 벗어나는 경우가 있으므로, 이를 방지하고자 숫자의 경우 다음과 같이 문자열로도 반환합니다.
```javascript
SomeContract.balancOf(user, (balance, balanceStr) => {
	...
});
```

## UPPERCASE 환경
프로젝트의 `DEPENDENCY` 파일에 `Hanul/Contract2Object`를 추가합니다.

## 기타 환경
Contract2Object는 [UPPERCASE-CORE-COMMON](https://github.com/Hanul/UPPERCASE/blob/master/DOC/GUIDE/UPPERCASE-CORE-COMMON.md)에 의존적입니다. 따라서 [UPPERCASE-CORE/COMMON.js 코드](https://github.com/Hanul/UPPERCASE/blob/master/UPPERCASE-CORE/COMMON.js)가 필요합니다.

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
	</head>
	<body>
	    <script src="UPPERCASE-CORE/COMMON.js"></script>
	    <script src="Contract2Object.js"></script>
	    <!-- main.js에 코드 입력 -->
	    <script src="main.js"></script>
	    <script>INIT_OBJECTS();</script>
	</body>
</html>
```

## 사용 예시
- [RankCoin](https://rankcoin.net/) - https://github.com/Hanul/RankCoin/blob/master/js/RankCoinContract.js

## 라이센스
[MIT](LICENSE)

## 작성자
[Young Jae Sim](https://github.com/Hanul)
