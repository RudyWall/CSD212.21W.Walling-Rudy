//I had more problems then expected and couldn't quite finish.

import { readFileSync } from 'fs';
import * as os from 'os';
import initPrompt from 'prompt-sync';
const prompt = initPrompt();

function init() {
    console.log("CODE⚡BREAKER")
    get_main_menu_selection()
}
function get_main_menu_selection() {
    //Recursively prompts the user to select one of the main menu options

    console.log("What do you want to do?")
    console.log("(i) Show instructions")
    console.log("(p) Play a game")
    console.log("(q) Quit")

    const response = prompt("")

    if (response == "i") {
        print_instructions();
    }
    else if (response == "p") {
        play_round();
    }
    else if (response == "q") {
        console.log("Ok bye!")
        return
    }
    else {
        console.log("I don't understand...")
    }
    get_main_menu_selection();

}
function print_instructions() {
    console.log("You select a code length.  The computer will pick a random numeric code of that length.  You then try to guess the code.  On every guess, the computer will tell you how many numbers in your guess are both the correct number and in the correct position (★) and how many are the correct number but not in the correct position (☆).  Using this information, you should eventually be able to deduce the correct code!")
}
function count_matches(code, matches) {
    return { num_matches: 0, num_semi_matches: 0 }
}
function play_round() {
    //Play one round of CODEBREAKER, and then update the game history file.

    //First, get the player's desired code length
    let code_length = get_code_length()

    //Print a bit of info about the player's history at this code length
    let history = load_history()
    if (history.has(code_length)) {
        let { num_games, best, average } = history.get(code_length)
        console.log(`The number of times you have tried codes of length ${code_length} is ${num_games}.  Your average and best number of guesses are ${average} and ${best}, respectively.`)
    }
    else {
        console.log(`This is your first time trying a code of length ${code_length}`)
    }
    //Generate a new random code
    let code = make_code(code_length)

    //Uncomment this print statement if you want to see the code for debugging purposes
    //print(code)

    //Repeatedly prompt the player for guesses and give them the appropriate feedback after each guess
    let num_guesses = 0
    while (true) {
        num_guesses += 1

        let guess = get_guess(code_length)

        if (guess == code) {
            console.log("You cracked the code!  Number of guesses: {num_guesses}")
            update_history(history, code_length, num_guesses)
            return
        }
        else {
            var num_matches, num_semi_matches = count_matches(code, guess)

            console.log(`★*${num_matches} ☆*${num_semi_matches} -*${code_length - num_matches - num_semi_matches}`)
        }
    }
}
function get_code_length() {
    //Recursively prompt the user for a numeric code length

    const response = prompt("How long do you want the code to be? ")

    if (!(is_string_numeric(response))) {
        console.log("You must enter a number")
        return get_code_length()
    }
    let n = Number(response)

    if (n < 2) {
        console.log("You must choose a number greater than 1")
        return get_code_length();
    }
    return n
}
function is_string_numeric(s) {
    //Returns True if the given string consists of only the digits 0-9

    /*First, make a list of which symbols in the given string are numeric (map)
    Then determine if that list is a sequence of only True values (reduce)*/
    return Array.from(s).map(is_numeric).reduce(all_true)
}
function all_true(a, b) {
    return a && b
}
function is_numeric(c) {
    /*Returns true if the given character is between '0' and '9'
        c is assumed to be a string of length 1*/
    return "0" <= c && c <= "9"
}
function load_history() {
    return new Map();
}

//I left the following load_history function as a comment but the one above for testing more.


//function load_history() {
/*Reads the history file into a dictionary and returns the dictionary.
   The file is assumed to contain a set of lines formatted as L:N:B:A
   where L, N, B, A are the code length, number of games at that code length,
   the best score (lowest number of guesses) for that code length, and the
   average score (average number of guesses) for that code length.
   
   The resultant dictionary has the different values for L as its keys, and
   the value for each key is an (N,B,A) tuple.*/

/*history_path = get_history_path()

history = {}
if (existsSync(history_path)) {
    try {
        (readFileSync((history_path, "w").toString() < string > f));
            for (line of f.readlines()) {
                if (line.strip() != "") { //Ignore empty lines
                    (code_length, num_games, best, average) == line.split(":")
                    history[int(code_length)] = (int(num_games), int(best), float(average))
                }
            }
        }
    finally {
        console.log("Uh oh, your history file could not be read")
    }
}
else {
    try {
        //Make an empty history file if there's not already one present
        f = open(history_path, "w")
        f.close()
    }
    finally {
        console.log("Uh oh, I couldn't create a history file for you")
    }
}
return history
}*/
function make_code(length) {
    /*Generate a random code string of the given length.
       Codes consist of the digits 0-9 in any position.
       (010, 007, and 000 are all possible codes.)
    */

    var code = "";
    for (_ in Array(length))
        code = Math.floor(Math.random() * 10);

    console.log(code)
}
function get_guess(code_length) {
    //Recursively prompt the player for a guess

    let guess = prompt("Guess the code: ")

    if ((guess).length != code_length) {
        console.log(`You must enter ${code_length} numbers`)
        return get_guess(code_length)
    }
    if (!is_string_numeric(guess)) {
        console.log("The code may contain only numbers")
        return get_guess(code_length)
    }
    return guess
}
function update_history(history, code_length, num_guesses) {
    /*Updates the given history dict such that the best and average scores for
       the given code_length entry incorporate the given num_guesses*/

    if (code_length in history) {
        //Get the current stats for the given code length
        [num_games, best, average] = history[code_length]

        //Print an appropriate message if the player did well
        if (num_guesses < best) {
            console.log(`${num_guesses} is a new best score for codes of length ${code_length}!`)
            //Update the best score if the player did better than the previous best
            best = num_guesses
        }
        else if (num_guesses < average) {
            console.log(`${num_guesses} is better than your average score of ${average} for codes of length ${code_length}!`)

            /*Calculate the new average score, factoring in the previous average, the number of games
            and the new given score*/
            average = ((average * num_games) + num_guesses) / (num_games + 1)

            /*Update the number of games
            IMPORTANT: This MUST come after the new_average calculation because that calculation
            assumes that num_games has not yet been updated.*/
            num_games += 1

            //Update the history for the given code length with the new stats we've calculated
            history[code_length] = (num_games, best, average)
        }
    }
    else {
        /*If the given code_length is not already in the history
        just add a new entry; this was the first game at that code length*/
        history[code_length] = (1, num_guesses, num_guesses)
    }
    write_history(history)
}
function write_history(history) {
    /*Writes the given history out to the history file in the format described in the
       load_history function*/
    let history_path = get_history_path()
    if (existsSync(history_path)) {
        try {
            (readFileSync((history_path, "w").toString() < string > f));
            for ((code_length, data) of (item(history))) {
                //See the load_history docstring for as description of the line format here
                f.write(f, "{code_length}:{data[0]}:{data[1]}:{data[2]}" + os.linesep)
            }

        }
        finally {
            console.log("Uh oh, the history file couldn't be updated")
        }
    }
}
function get_history_path() {
    /*Returns the path to the history file used by *he game.
       The path is to a file named 'CODEBREAKER.history' in the users' home directory*/
    return path.join(os.path.expanduser("~"), "CODEBREAKER.history")
}
init()
