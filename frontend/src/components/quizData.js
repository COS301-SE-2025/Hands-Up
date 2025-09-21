export const COMMON_PHRASES = [
    { id: 'hello_my_name', phrase: 'Hello My Name', words: ['helloMyName'] },
    { id: 'nice_meet_you', phrase: 'Nice To Meet You', words: ['niceToMeetYou'] },
    { id: 'i_love_you', phrase: 'I Love You', words: ['iLoveYou'] },
    { id: 'i_am_happy', phrase: 'I Am Happy', words: ['meHappy'] },
    { id: 'i_am_sad', phrase: 'I Am Sad', words: ['meSad'] },
    { id: 'see_you_tomorrow', phrase: 'See You Tomorrow', words: ['seeYouTomorrow'] },
    { id: 'i_am_hungry', phrase: 'I Am Hungry', words: ['meHungry'] },
    { id: 'drink_water', phrase: 'Drink Water', words: ['drinkWater'] },
    { id: 'my_mother', phrase: 'My Mother', words: ['myMother'] },
    { id: 'my_father', phrase: 'My Father', words: ['myFather'] },
    { id: 'brother_sister', phrase: 'My Brother and Sister', words: ['myBrotherAndSister'] },
    { id: 'go_sleep', phrase: 'Go To Sleep', words: ['goSleep'] },
    { id: 'i_understand', phrase: 'I Understand', words: ['meUnderstand'] },
    { id: 'hot_weather', phrase: 'Hot Weather', words: ['hotWeather'] },
    { id: 'cold_weather', phrase: 'Cold Weather', words: ['coldWeather'] },
    { id: 'eat_apple', phrase: 'Eat an Apple', words: ['eatApple'] },
    { id: 'my_pet_is_a_dog', phrase: 'My Pet Is A Dog', words: ['myPetDog'] }
];

export const CATEGORIES = {
    alphabets: {
        name: 'The Alphabet',
        items: 'abcdefghijklmnopqrstuvwxyz'.split('')
    },
    numbers: {
        name: 'Numbers & Counting',
        items: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']
    },
    colours: {
        name: 'Colours',
        items: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'gold', 'silver']
    },
    introduce: {
        name: 'Introduce Yourself',
        items: ['hello', 'name', 'my', 'again', 'goodbye', 'nice', 'meet', 'you', 'this', 'sorry', 'and']
    },
    family: {
        name: 'Family Members',
        items: ['brother', 'sister', 'mother', 'father', 'aunt', 'uncle', 'grandma', 'grandpa', 'child', 'siblings', 'boy', 'girl']
    },
    feelings: {
        name: 'Emotions & Feelings',
        items: ['happy', 'sad', 'angry', 'cry', 'sorry', 'like', 'love', 'hate', 'feel']
    },
    actions: {
        name: 'Common Actions',
        items: ['drive', 'watch', 'see', 'sleep', 'walk', 'stand', 'sit', 'give', 'understand', 'go', 'stay', 'talk']
    },
    questions: {
        name: 'Asking Questions',
        items: ['why', 'tell', 'when', 'who', 'which']
    },
    time: {
        name: 'Time & Days',
        items: ['today', 'tomorrow', 'yesterday', 'year', 'now', 'future', 'oclock', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    food: {
        name: 'Food & Drinks',
        items: ['water', 'apple', 'drink', 'cereal', 'eggs', 'eat', 'hungry', 'full', 'cup', 'popcorn', 'candy', 'soup', 'juice', 'milk', 'pizza']
    },
    things: {
        name: 'Objects & Things',
        items: ['shower', 'table', 'lights', 'computer', 'hat', 'chair', 'car', 'ambulance', 'window']
    },
    animals: {
        name: 'Animals',
        items: ['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'animal']
    },
    seasons: {
        name: 'Weather & Seasons',
        items: ['spring', 'summer', 'autumn', 'winter', 'sun', 'rain', 'cloudy', 'snow', 'wind', 'sunrise', 'hot', 'cold', 'warm', 'cool', 'weather', 'freeze']
    },
    phrases: {
        name: 'Common Phrases',
        items: COMMON_PHRASES
    }
};