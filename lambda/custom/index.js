'use strict';
const Alexa = require("alexa-sdk");
const foundingFathers = require('./foundingFathers');
const worldLeaders = require('./worldLeaders');
const beasts = require('./beasts');


// App Config

const APP_ID = "amzn1.ask.skill.77bcdb88-b0e9-4a3a-9e45-cfea540bc9b5";
const states = {
    introMode : "introMode",
    foundingFatherMode : "foundingFatherMode",
    worldLeaderMode : "worldLeaderMode",
    beastMode : "beastMode"
};
const QUIZ_LENGTH = 8;
const RESULT_TEXT = '<break time="1s" />If you would like to play a different quiz, say "New Quiz". If you are finished you can say stop.';


// App Handler Functions


const newSessionHandler = {

    'LaunchRequest' : function (){
        this.handler.state = states.introMode;
        this.emitWithState('Greeting');
    }
};

const introHandler = Alexa.CreateStateHandler(states.introMode, {

    // Session Functions 
    
    'LaunchRequest': function () {
        this.emitWithState('Greeting');
    },

    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
        this.emit(':saveState', true);
    },

    // Amazon Built-in Intents
    
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },  
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You'll be given a series of questions. Simply say the number that matches your preferred answer. Do you want to continue with the quiz?").listen('Say yes to continue the quiz or no to quit.');
        this.emit(':responseReady');
    },
    'AMAZON.NoIntent' : function () {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },
    'AMAZON.YesIntent' : function () {
        this.emitWithState('Greeting');
    },

    // Custom Intents
    'BeastIntent' : function (){
        this.handler.state = states.beastMode;
        const text = beasts.QUESTIONS[0].question;
        this.emitWithState('Question', text);
    },

    'FoundingFatherIntent' : function (){
        this.handler.state = states.foundingFatherMode;
        const text = foundingFathers.QUESTIONS[0].question;
        this.emitWithState('Question', text);
    },

    'Greeting' : function (){
        this.attributes.currentQuestionIndex = 0;
        this.attributes.currentPoints = [];
        const text = 'Welcome to Past Lives Quiz. Do you want to find out which world leader you are, which founding father you are or which mythical beast you are?';
        const reprompt = 'You can say world leader, founding father, or mythical beast';
        this.response.speak(text).listen(reprompt);
        this.emit(':responseReady');
    },

    'WorldLeaderIntent' : function (){
        this.handler.state = states.worldLeaderMode;
        const text = worldLeaders.QUESTIONS[0].question;
        this.emitWithState('Question', text);
    },

    'Unhandled' : function () {
        this.response.speak("Sorry, I didn't understand that. You can say world leader, founding father or mythical beast").listen("You can say world leader, founding father or mythical beast");
        this.emit(':responseReady');
    }
});

const beastHandlers = Alexa.CreateStateHandler(states.beastMode, {
    
    // Session Functions 
    
    'LaunchRequest': function () {
        if(this.attributes.currentQuestionIndex !== 0){
            this.emitWithState('Return');
        } else {
           this.handler.state = states.introMode;
           this.emitWithState('Greeting'); 
        }
        
    },

    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
        this.emit(':saveState', true);
    },

    // Amazon Built-in Intents
    
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },  
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You'll be given a series of questions. To answer, simply say the number that matches your preferred answer. Do you want to continue with the game?").listen('Say yes to continue the game or no to quit.');
        this.emit(':responseReady');
    },
    'AMAZON.NoIntent' : function () {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },
    'AMAZON.ResumeIntent' : function (){
        this.emitWithState('Question');
    },
    'AMAZON.StartOverIntent' : function () {
        this.handler.state = states.introMode;
        this.emitWithState('Greeting');
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },
    'AMAZON.YesIntent' : function () {
        this.emitWithState('Question');
    },


    // Custom Intents
    
    'GuessIntent' : function () {
        const guessNum = parseInt(this.event.request.intent.slots.number.value);
        if(guessNum === 1){
            this.emitWithState('OneIntent');
        } else if (guessNum === 2){
            this.emitWithState('TwoIntent');
        } else if (guessNum === 3){
            this.emitWithState('ThreeIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'NewQuizIntent' : function (){
        this.handler.state = states.introMode;
        this.emitWithState('Greeting');
    },

    'OneIntent' : function () { 
        this.attributes.currentPoints.push(beasts.QUESTIONS[this.attributes.currentQuestionIndex].one);
        this.attributes.currentQuestionIndex++;
        if(this.attributes.currentQuestionIndex === QUIZ_LENGTH){
            this.emitWithState('Result');
        } else {
            const text = beasts.QUESTIONS[this.attributes.currentQuestionIndex].question;
            this.emitWithState('Question', text);
        }
    },

    'Question' : function (text){
        this.response.speak(text).listen(text);
        this.emit(':responseReady');
    },

    'Result' : function () {
        const result = getMatch.call(this, 'beasts');
        this.response.speak(beasts[result] + RESULT_TEXT).listen(RESULT_TEXT);
        this.emit(':responseReady');
    },

    'Return' : function () {
        this.response.speak('Welcome back, if you would like to continue your quiz, say resume. If you would like to start a new quiz, say "New Quiz".').listen('if you would like to continue your quiz, say resume. If you would like to start a new quiz, say "New Quiz".');
        this.emit(':responseReady');
    },

    'ThreeIntent' : function () {  
        this.attributes.currentPoints.push(beasts.QUESTIONS[this.attributes.currentQuestionIndex].three);
        this.attributes.currentQuestionIndex++;
        if(this.attributes.currentQuestionIndex === QUIZ_LENGTH){
            this.emitWithState('Result');
        } else {
            const text = beasts.QUESTIONS[this.attributes.currentQuestionIndex].question;
            this.emitWithState('Question', text);
        }
    },

    'TwoIntent' : function () {  
        this.attributes.currentPoints.push(beasts.QUESTIONS[this.attributes.currentQuestionIndex].two);
        this.attributes.currentQuestionIndex++;
        if(this.attributes.currentQuestionIndex === QUIZ_LENGTH){
            this.emitWithState('Result');
        } else {
            const text = beasts.QUESTIONS[this.attributes.currentQuestionIndex].question;
            this.emitWithState('Question', text);
        }
    },

    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. Please answer with one, two or three.").listen('Please answer with one, two or three');
        this.emit(':responseReady');
    }

});

const foundingFatherHandlers = Alexa.CreateStateHandler(states.foundingFatherMode,  {
    
    // Session Functions 
    
    'LaunchRequest': function () {
        if(this.attributes.currentQuestionIndex !== 0){
            this.emitWithState('Return');
        } else {
           this.handler.state = states.introMode;
           this.emitWithState('Greeting'); 
        }
        
    },

    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
        this.emit(':saveState', true);
    },

    // Amazon Built-in Intents
    
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },  
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You'll be given a series of questions. To answer, simply say the number that matches your preferred answer. Do you want to continue with the game?").listen('Say yes to continue the game or no to quit.');
        this.emit(':responseReady');
    },
    'AMAZON.NoIntent' : function () {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },
    'AMAZON.ResumeIntent' : function (){
        this.emitWithState('Question');
    },
    'AMAZON.StartOverIntent' : function () {
        this.handler.state = states.introMode;
        this.emitWithState('Greeting');
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },
    'AMAZON.YesIntent' : function () {
        this.emitWithState('Question');
    },

    // Custom Intents
    
    'GuessIntent' : function () {
        const guessNum = parseInt(this.event.request.intent.slots.number.value);
        if(guessNum === 1){
            this.emitWithState('OneIntent');
        } else if (guessNum === 2){
            this.emitWithState('TwoIntent');
        } else if (guessNum === 3){
            this.emitWithState('ThreeIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'NewQuizIntent' : function (){
        this.handler.state = states.introMode;
        this.emitWithState('Greeting');
    },

    'OneIntent' : function () {
        this.attributes.currentPoints.push(foundingFathers.QUESTIONS[this.attributes.currentQuestionIndex].one);
        this.attributes.currentQuestionIndex++;
        if(this.attributes.currentQuestionIndex === QUIZ_LENGTH){
            this.emitWithState('Result');
        } else {
            const text = foundingFathers.QUESTIONS[this.attributes.currentQuestionIndex].question;
            this.emitWithState('Question', text);
        }
    },

    'Question' : function (text){
        this.response.speak(text).listen(text);
        this.emit(':responseReady');
    },

    'Result' : function () {
        const result = getMatch.call(this, 'foundingFathers');
        this.response.speak(foundingFathers[result] + RESULT_TEXT).listen(RESULT_TEXT);
        this.emit(':responseReady');
    },

    'Return' : function () {
        this.response.speak('Welcome back, if you would like to continue your quiz, say resume. If you would like to start a new quiz, say "New Quiz".').listen('if you would like to continue your quiz, say resume. If you would like to start a new quiz, say "New Quiz".');
        this.emit(':responseReady');
    },

    'ThreeIntent' : function () {
        this.attributes.currentPoints.push(foundingFathers.QUESTIONS[this.attributes.currentQuestionIndex].two);
        this.attributes.currentQuestionIndex++;
        if(this.attributes.currentQuestionIndex === QUIZ_LENGTH){
            this.emitWithState('Result');
        } else {
            const text = foundingFathers.QUESTIONS[this.attributes.currentQuestionIndex].question;
            this.emitWithState('Question', text);
        }
    },

    'TwoIntent' : function () {
        this.attributes.currentPoints.push(foundingFathers.QUESTIONS[this.attributes.currentQuestionIndex].two);
        this.attributes.currentQuestionIndex++;
        if(this.attributes.currentQuestionIndex === QUIZ_LENGTH){
            this.emitWithState('Result');
        } else {
            const text = foundingFathers.QUESTIONS[this.attributes.currentQuestionIndex].question;
            this.emitWithState('Question', text);
        }
    },

    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. Please answer with one, two or three.").listen('Please answer with one, two or three');
        this.emit(':responseReady');
    }
    
});

const worldLeaderHandlers = Alexa.CreateStateHandler(states.worldLeaderMode, {
    
    // Session Functions 
    
    'LaunchRequest': function () {
        if(this.attributes.currentQuestionIndex !== 0){
            this.emitWithState('Return');
        } else {
           this.handler.state = states.introMode;
           this.emitWithState('Greeting'); 
        }
        
    },

    'SessionEndedRequest' : function() {
        console.log('Session ended with reason: ' + this.event.request.reason);
        this.emit(':saveState', true);
    },

    // Amazon Built-in Intents
    
    'AMAZON.CancelIntent' : function() {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },  
    'AMAZON.HelpIntent' : function() {
        this.response.speak("You'll be given a series of questions. To answer, simply say the number that matches your preferred answer. Do you want to continue with the game?").listen('Say yes to continue the game or no to quit.');
        this.emit(':responseReady');
    },
    'AMAZON.NoIntent' : function () {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },
    'AMAZON.ResumeIntent' : function (){
        this.emitWithState('Question');
    },
    'AMAZON.StartOverIntent' : function () {
        this.handler.state = states.introMode;
        this.emitWithState('Greeting');
    },
    'AMAZON.StopIntent' : function() {
        this.response.speak('Thanks for playing Past Lives Quiz. Come back again sometime.');
        this.emit(':responseReady');
    },
    'AMAZON.YesIntent' : function () {
        this.emitWithState('Question');
    },

    // Custom Intents
    
    'GuessIntent' : function () {
        const guessNum = parseInt(this.event.request.intent.slots.number.value);
        if(guessNum === 1){
            this.emitWithState('OneIntent');
        } else if (guessNum === 2){
            this.emitWithState('TwoIntent');
        } else if (guessNum === 3){
            this.emitWithState('ThreeIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'NewQuizIntent' : function (){
        this.handler.state = states.introMode;
        this.emitWithState('Greeting');
    },

    'OneIntent' : function () {
        this.attributes.currentPoints.push(worldLeaders.QUESTIONS[this.attributes.currentQuestionIndex].one);
        this.attributes.currentQuestionIndex++;
        if(this.attributes.currentQuestionIndex === QUIZ_LENGTH){
            this.emitWithState('Result');
        } else {
            const text = worldLeaders.QUESTIONS[this.attributes.currentQuestionIndex].question;
            this.emitWithState('Question', text);
        }
    },

    'Question' : function (text){
        this.response.speak(text).listen(text);
        this.emit(':responseReady');
    },

    'Result' : function () {
        const result = getMatch.call(this, 'worldLeaders');
        this.response.speak(worldLeaders[result] + RESULT_TEXT).listen(RESULT_TEXT);
        this.emit(':responseReady');
    },

    'Return' : function () {
        this.response.speak('Welcome back, if you would like to continue your quiz, say resume. If you would like to start a new quiz, say "New Quiz".').listen('if you would like to continue your quiz, say resume. If you would like to start a new quiz, say "New Quiz".');
        this.emit(':responseReady');
    },

    'ThreeIntent' : function () {
        this.attributes.currentPoints.push(worldLeaders.QUESTIONS[this.attributes.currentQuestionIndex].three);
        this.attributes.currentQuestionIndex++;
        if(this.attributes.currentQuestionIndex === QUIZ_LENGTH){
            this.emitWithState('Result');
        } else {
            const text = worldLeaders.QUESTIONS[this.attributes.currentQuestionIndex].question;
            this.emitWithState('Question', text);
        }
    },

    'TwoIntent' : function () {
        this.attributes.currentPoints.push(worldLeaders.QUESTIONS[this.attributes.currentQuestionIndex].two);
        this.attributes.currentQuestionIndex++;
        if(this.attributes.currentQuestionIndex === QUIZ_LENGTH){
            this.emitWithState('Result');
        } else {
            const text = worldLeaders.QUESTIONS[this.attributes.currentQuestionIndex].question;
            this.emitWithState('Question', text);
        }
    },

    'Unhandled' : function() {
        this.response.speak("Sorry, I didn't get that. Please answer with one, two or three.").listen('Please answer with one, two or three');
        this.emit(':responseReady');
    }

});

// App Helper Functions

function getMatch (quiz) {
    let oneCount = 0;
    let twoCount = 0;
    let threeCount = 0;
    let finalCount = '';

    for(let i = 0; i < this.attributes.currentPoints.length; i++){
        if(this.attributes.currentPoints[i] === 1){
            oneCount += 1;
        } else if(this.attributes.currentPoints[i] === 2){
            twoCount += 1;
        } else {
            threeCount += 1;
        }
    };

    if(oneCount > twoCount){
        if(oneCount > threeCount){
            finalCount = 'one';
        } else if (oneCount === threeCount){
            console.log(Math.round(Math.random()))
            if(Math.round(Math.random()) === 0) {
                finalCount = 'one';
            } else {
                finalCount = 'three';
            }
        } else {
            finalCount = 'three';
        };
    } else if (twoCount > threeCount){
        finalCount = 'two';
    } else if (twoCount === threeCount){
        if(Math.round(Math.random()) === 0) {
            finalCount = 'two';
        } else {
            finalCount = 'three';
        }
    } else {
        finalCount = 'three';
    };

    if(quiz === 'beasts'){
        switch(finalCount) {
            case 'one':
                return 'CENTAUR';
            case 'two':
                return 'UNICORN';
            case 'three':
                return 'CERBERUS'
        }
    } else if (quiz === 'foundingFathers') {
        switch(finalCount) {
            case 'one':
                return 'HAMILTON';
            case 'two':
                return 'FRANKLIN';
            case 'three':
                return 'WASHINGTON'
        }
    } else {
        switch(finalCount) {
            case 'one':
                return 'HATSEPSHUT';
            case 'two':
                return 'ELIZABETH';
            case 'three':
                return 'MERKEL'
        }
    }
}

// App Execution

exports.handler = function(event, context) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'PastLivesQuiz'; 
    alexa.registerHandlers(newSessionHandler, introHandler, foundingFatherHandlers, worldLeaderHandlers, beastHandlers);
    alexa.execute();
};

