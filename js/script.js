// Constants
const CATEGORIES = [
	{
		textContent: "Film & TV",
		value: "film_and_tv",
	},
	{
		textContent: "Food & Drink",
		value: "food_and_drink",
	},
	{
		textContent: "General",
		value: "general_knowledge",
	},
	{
		textContent: "Geography",
		value: "geography",
	},
	{
		textContent: "History",
		value: "history",
	},
	{
		textContent: "Music",
		value: "music",
	},
	{
		textContent: "Science",
		value: "science",
	},
	{
		textContent: "Sport & Leisure",
		value: "sport_and_leisure",
	},
];
const TRIVIA_API_URL_BASE = "https://the-trivia-api.com/api/questions?";

// Variables needed for monitoring current state
let activeCategory;
let activeQuestionsNumber;
let activeDifficulty;
let allQuestions;
let currentQuestionNumber = 0;

const validation = {
	isCategoryChoosen: false,
	isDifficultyChoosen: false,
	isNumberOfQuestionsChoosen: false,
};

// Options buttons
const categoryButtons = document.querySelector("#categories").children;
const categoryButtonsContainer = document.querySelector("#categories");
const questionsNumberButtons =
	document.querySelector("#questions-number").children;
const difficultyButtons = document.querySelector("#difficulties").children;

//Controls buttons
const startGameButton = document.querySelector("#start-game");
const resetButton = document.querySelector("#reset");
const nextQuestionButton = document.querySelector("#next-question");
const backToMenuButton = document.querySelector("#back-to-menu");
const finishButton = document.querySelector("#finish");
const tryAgainButton = document.querySelector("#try-again");
const resultMenuButton = document.querySelector("#result-menu");

// Containers
const menuContainer = document.querySelector("#menu");
const gameContainer = document.querySelector("#game");
const questionMarkersContainer = document.querySelector("#question-markers");
const answersContainer = document.querySelector("#answers");
const tint = document.querySelector("#tint");
const backdrop = document.querySelector("#backdrop");
const resultMarkersContainer = document.querySelector("#result-markers");

// Text elements
const questionTitle = document.querySelector("#question");
const errorSpan = document.querySelector("#error");
const mainTitle = document.querySelector("#main-title");
const resultValue = document.querySelector("#result");

// Images
const throphyImg = document.querySelector("#throphy");
const laurelImg = document.querySelector("#laurel-leaves");

// Adding all category buttons to document
const setup = () => {
	for (const category of CATEGORIES) {
		const currentButton = document.createElement("button");
		currentButton.classList.add("menu-button");
		currentButton.setAttribute("value", category.value);
		currentButton.textContent = category.textContent;
		categoryButtonsContainer.appendChild(currentButton);
	}
};

setup();

// Category buttons event listeners setup
for (const category of categoryButtons) {
	category.addEventListener("click", () => {
		activateButton(category, "category", activeCategory, categoryButtons);
	});
}

// Number of questions buttons event listeners setup
for (const questionsNumber of questionsNumberButtons) {
	questionsNumber.addEventListener("click", () => {
		activateButton(
			questionsNumber,
			"number",
			activeQuestionsNumber,
			questionsNumberButtons
		);
	});
}

// Difficulty buttons event listeners setup
for (const difficulty of difficultyButtons) {
	difficulty.addEventListener("click", () => {
		activateButton(difficulty, "diff", activeDifficulty, difficultyButtons);
	});
}

resetButton.addEventListener("click", () => {
	resetOptions();
});

startGameButton.addEventListener("click", () => {
	startGame();
});

// Highlighting active option button
const activateButton = (target, buttonType, currentValue, buttons) => {
	const targetValue = target.getAttribute("value");
	if (currentValue !== undefined && targetValue === currentValue) {
		setCurrentOption(buttonType, undefined, false);
		target.classList.remove("active");
		validationProxy.get();
		return;
	}
	target.classList.add("active");
	setCurrentOption(buttonType, targetValue, true);
	for (const button of buttons) {
		if (button.getAttribute("value") === targetValue) {
			continue;
		}
		button.classList.remove("active");
	}
	validationProxy.get();
};

const setCurrentOption = (buttonType, value, isValid) => {
	if (buttonType === "category") {
		activeCategory = value;
		validation.isCategoryChoosen = isValid;
	} else if (buttonType === "diff") {
		activeDifficulty = value;
		validation.isDifficultyChoosen = isValid;
	} else {
		activeQuestionsNumber = value;
		validation.isNumberOfQuestionsChoosen = isValid;
	}
};

// Reseting all choosen options (category, number of questions, difficulty)
const resetOptions = () => {
	activeCategory = undefined;
	activeQuestionsNumber = undefined;
	activeDifficulty = undefined;
	const allActiveButtons = document.querySelectorAll(".active");
	for (const button of allActiveButtons) {
		button.classList.remove("active");
	}
	clearValidation();
	validationProxy.get();
};

// Starting game (sending api request, setting first question)
const startGame = () => {
	setupGame();
};

// Validating options
const validateOptions = {
	get(target) {
		console.log("in", target);
		if (
			target.isCategoryChoosen &&
			target.isDifficultyChoosen &&
			target.isNumberOfQuestionsChoosen
		) {
			startGameButton.classList.remove("start-game-inactive");
			startGameButton.classList.add("start-game");
		} else {
			startGameButton.classList.remove("start-game");
			startGameButton.classList.add("start-game-inactive");
		}
	},
};

const clearValidation = () => {
	validation.isCategoryChoosen = false;
	validation.isDifficultyChoosen = false;
	validation.isNumberOfQuestionsChoosen = false;
};

const validationProxy = new Proxy(validation, validateOptions);

// Sending api request to Trivia API
const sendApiRequest = async (category, difficulty, questionsNumber) => {
	const response = await fetch(
		`${TRIVIA_API_URL_BASE}limit=${questionsNumber}&categories=${category}&difficulty=${difficulty}`,
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	const data = await response.json();
	if (!response.ok) {
		throw new Error("Questions didnt fetch properly!");
	}
	console.log(data);
	return data;
};

// Setting up game (hidding menu, showing game itself, setting up first question, setting up markers)
const setupGame = async () => {
	const data = await sendApiRequest(
		activeCategory,
		activeDifficulty,
		activeQuestionsNumber
	);
	questionMarkersContainer.innerHTML = "";
	allQuestions = data;
	menuContainer.classList.add("hidden");
	gameContainer.classList.remove("hidden");
	mainTitle.classList.add("hidden");
	setupQuestion(allQuestions[currentQuestionNumber]);
	setupMarkers(activeQuestionsNumber);
};

const setupMarkers = (questionsNumber) => {
	for (let i = 0; i < questionsNumber; i++) {
		const currentMarker = document.createElement("div");
		currentMarker.classList.add("marker");
		currentMarker.setAttribute("id", `marker${i}`);
		questionMarkersContainer.appendChild(currentMarker);
	}
};

// Setting up question and answers to that question
const setupQuestion = (question) => {
	nextQuestionButton.classList.add("hidden");
	questionTitle.textContent = question.question;
	let answers = question.incorrectAnswers;
	const correctAnswerTargetIndex = randomizeCorrectAnswerPlace();
	answers.push(question.correctAnswer);
	changeCorrectAnswerPosition(correctAnswerTargetIndex, answers);
	setupAnswers(answers, correctAnswerTargetIndex);
};

const setupAnswers = (answers, correctAnswerIndex) => {
	answersContainer.innerHTML = "";
	for (let i = 0; i < answers.length; i++) {
		const button = document.createElement("button");
		button.setAttribute("id", `answer${i}`);
		const text = document.createElement("p");
		button.appendChild(text);
		if (i === correctAnswerIndex) {
			button.classList.add("correct");
		} else {
			button.classList.add("incorrect");
		}
		button.addEventListener("click", () => {
			answerButtonListener(button, correctAnswerIndex);
		});
		const answer = answers[i];
		text.textContent = answer;
		answersContainer.appendChild(button);
	}
};

const answerButtonListener = (button, correctAnswerIndex) => {
	for (const button of answersContainer.children) {
		button.classList.add("answer-after");
	}
	const currentMarker = document.querySelector(
		`#marker${currentQuestionNumber}`
	);
	if (button.getAttribute("id") === `answer${correctAnswerIndex}`) {
		setTimeout(() => {
			currentMarker.classList.add("correct-marker");
		}, 100);
	} else {
		setTimeout(() => {
			currentMarker.classList.add("incorrect-marker");
		}, 100);
	}
	setTimeout(() => {
		if (currentQuestionNumber + 1 === +activeQuestionsNumber) {
			finishButton.classList.remove("hidden");
		} else {
			nextQuestionButton.classList.remove("hidden");
		}
	}, 100);
};

const randomizeCorrectAnswerPlace = () => {
	return Math.floor(Math.random() * 4);
};

const changeCorrectAnswerPosition = (correctAnswerTargetIndex, answers) => {
	const tempValue = answers[correctAnswerTargetIndex];
	answers[correctAnswerTargetIndex] = answers[3];
	answers[3] = tempValue;
	return answers;
};

// Game controls event listeners setup
nextQuestionButton.addEventListener("click", () => {
	currentQuestionNumber++;
	setupQuestion(allQuestions[currentQuestionNumber]);
});

backToMenuButton.addEventListener("click", () => {
	backToMenuEventListener();
});

const backToMenuEventListener = () => {
	menuContainer.classList.remove("hidden");
	gameContainer.classList.add("hidden");
	mainTitle.classList.remove("hidden");
	clearValidation();
	activeCategory = undefined;
	activeDifficulty = undefined;
	activeQuestionsNumber = undefined;
	allQuestions = [];
	currentQuestionNumber = 0;
	const allActiveButtons = document.querySelectorAll(".active");
	for (const button of allActiveButtons) {
		button.classList.remove("active");
	}
	questionMarkersContainer.innerHTML = "";
	answersContainer.innerHTML = "";
	resultMarkersContainer.innerHTML = "";
	validationProxy.get();
};

finishButton.addEventListener("click", () => {
	setResultInfo();
	showResultWindow();
});

const showResultWindow = () => {
	tint.classList.add("tint-animation");
	backdrop.classList.add("backdrop-animation");
	throphyImg.classList.add("throphy-after");
	laurelImg.classList.add("laurel-leaves-after");
};

const setResultInfo = () => {
	const markers = questionMarkersContainer.children;
	const markerCopies = [];
	for (const marker of markers) {
		const clone = marker.cloneNode(true);
		markerCopies.push(clone);
	}
	const correctsNumber = document.querySelectorAll(".correct-marker").length;
	for (const marker of markerCopies) {
		resultMarkersContainer.appendChild(marker);
	}
	resultValue.textContent = `${correctsNumber} / ${markers.length}`;
};

tryAgainButton.addEventListener("click", () => {
	currentQuestionNumber = 0;
	finishButton.classList.add("hidden");
	resultMarkersContainer.innerHTML = "";

	setupGame();
	hideResultWindow();
});

resultMenuButton.addEventListener("click", () => {
	hideResultWindow();
	finishButton.classList.add("hidden");
	backToMenuEventListener();
});

const hideResultWindow = () => {
	tint.classList.remove("tint-animation");
	backdrop.classList.remove("backdrop-animation");
	throphyImg.classList.remove("throphy-after");
	laurelImg.classList.remove("laurel-leaves-after");
};
