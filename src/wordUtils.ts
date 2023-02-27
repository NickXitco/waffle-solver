import { Letter, LetterState, LetterWithWordPos } from './types'
import { definiteYellowIndices, MASTER_WORD_LIST, wordMappings } from './constants'
import {
	filterBasedOnDefiniteYellows,
	filterBasedOnGreens,
	filterBasedOnGreys,
	filterBasedOnPool,
	filterBasedOnUncertainYellows,
} from './wordFilters'

export const getYellowCrossings = (letters: Letter[], wordIndices: number[]) => {
	const yellowCrossings: Letter[] = []
	for (const index of wordIndices) {
		// If the crossing is green, nothing else can go in there, so we don't need to check
		if (letters[index].state === LetterState.GREEN) continue

		// Find the other word in the grid with the shared index
		for (const word of wordMappings) {
			if (word === wordIndices) continue
			if (word.includes(index)) {
				// Once we've found this word, add all yellow letters to the crossings
				for (const j of word) {
					if (letters[j].state === LetterState.YELLOW) {
						yellowCrossings.push(letters[j])
					}
				}
			}
		}
	}

	return yellowCrossings
}

export const getLettersInWordPool = (letters: Letter[], wordIndices: number[]) => {
	const yellowCrossings = getYellowCrossings(letters, wordIndices).map((c) => c.index)

	return letters.filter((l) => {
		const letterIsInAnotherWord =
			(l.state === LetterState.GREEN || l.state === LetterState.YELLOW) && !wordIndices.includes(l.index)
		const letterIsNotInThisWord = l.state === LetterState.GREY && wordIndices.includes(l.index)

		const letterIsInCrossing = yellowCrossings.includes(l.index)

		return !(letterIsInAnotherWord || letterIsNotInThisWord) || letterIsInCrossing
	})
}

/**
 * Checks if a yellow index is definitely in the word (doesn't have any other connected words)
 * @param index
 */
export const isDefiniteYellow = (index: number) => {
	return definiteYellowIndices.includes(index)
}

export const getDefiniteGreens = (letters: Letter[], indices: number[]) => {
	return letters
		.filter((l) => l.state === LetterState.GREEN && indices.includes(l.index))
		.map((l) => ({
			...l,
			pos: indices.indexOf(l.index),
		})) as LetterWithWordPos[]
}

export const getDefiniteYellows = (letters: Letter[], indices: number[]) => {
	return letters
		.filter((l) => l.state === LetterState.YELLOW && indices.includes(l.index) && isDefiniteYellow(l.index))
		.map((l) => ({
			...l,
			pos: indices.indexOf(l.index),
		})) as LetterWithWordPos[]
}

export const getUncertainYellows = (letters: Letter[], indices: number[]) => {
	return letters
		.filter((l) => l.state === LetterState.YELLOW && indices.includes(l.index) && !isDefiniteYellow(l.index))
		.map((l) => ({
			...l,
			pos: indices.indexOf(l.index),
		})) as LetterWithWordPos[]
}

export const getDefiniteGreys = (letters: Letter[], indices: number[]) => {
	return letters
		.filter((l) => l.state === LetterState.GREY && indices.includes(l.index))
		.map((l) => ({
			...l,
			pos: indices.indexOf(l.index),
		})) as LetterWithWordPos[]
}
export const findPossibleWords = (letters: Letter[], indices: number[]) => {
	let possibleWords: string[]

	const pool = getLettersInWordPool(letters, indices)
	const definiteGreens = getDefiniteGreens(letters, indices)
	const definiteYellows = getDefiniteYellows(letters, indices)
	const uncertainYellows = getUncertainYellows(letters, indices)
	const definiteGreys = getDefiniteGreys(letters, indices)

	possibleWords = filterBasedOnGreens(definiteGreens)
	possibleWords = filterBasedOnDefiniteYellows(possibleWords, definiteYellows)
	possibleWords = filterBasedOnGreys(possibleWords, definiteGreys)
	possibleWords = filterBasedOnUncertainYellows(possibleWords, uncertainYellows)
	possibleWords = filterBasedOnPool(pool, possibleWords)

	return possibleWords
}

function getPossibleLetters(word: string, letters: Letter[], indices: number[]) {
	const pool = getLettersInWordPool(letters, indices)
	const definiteGreens = getDefiniteGreens(letters, indices)
	const definiteYellows = getDefiniteYellows(letters, indices)
	const uncertainYellows = getUncertainYellows(letters, indices)
	const possibleLetters: Letter[][] = []

	for (let i = 0; i < word.length; i++) {
		const letter = word[i]

		// Find if there's a green letter in that position, if there is then there's no other option
		for (const green of definiteGreens) {
			if (green.pos === i) {
				possibleLetters[i] = [green]
				break
			}
		}

		// If there's a green there, there's no other options
		if (possibleLetters[i]) continue

		// Find if there's a yellow letter that's definitely in the word. If there is, use it
		possibleLetters[i] = []
		for (const yellow of definiteYellows) {
			if (yellow.pos !== i && yellow.letter === letter) {
				possibleLetters[i].push(yellow)
			}
		}

		// Find if there's a yellow letter that could be in the word
		for (const yellow of uncertainYellows) {
			if (yellow.pos !== i && yellow.letter === letter) {
				possibleLetters[i].push(yellow)
			}
		}

		const possibleIndices = possibleLetters[i].map((a) => a.index)
		const crossingYellows = getYellowCrossings(letters, indices).filter((a) => !possibleIndices.includes(a.index))

		// Get crossing yellows if they're valid
		for (const yellow of crossingYellows) {
			const a = indices[i]
			const b = yellow.index

			for (const w of wordMappings) {
				if (w.includes(a) && w.includes(b) && yellow.letter === letter) {
					possibleLetters[i].push(yellow)
					break
				}
			}
		}

		// Check other letters
		for (const poolLetter of pool) {
			if (
				(poolLetter.state === LetterState.GREY || poolLetter.state === LetterState.UNKNOWN) &&
				poolLetter.letter === letter
			) {
				possibleLetters[i].push(poolLetter)
			}
		}
	}
	return possibleLetters
}

/**
 * Expands the possible letters at each position in the word to be a list of possible chains.
 * For each possible letter list X_n : possibleLetters, the length of this final list of chains
 * will be |X_0| * |X_1| * ... * |X_4|
 *
 * For example, if there was 1 option for the first letter of the word we'd start with
 * [[A5]]
 *
 * then if there were 2 options (L14, L2) for the second letter, we'd have
 * [[A5,L14], [A5,L2]]
 *
 * then if there was 1 option (B20) for #3:
 * [[A5,L14,B20], [A5,L2,B20]]
 *
 * then 3 (U7, 8, 9) for #4:
 * [[A5,L14,B20,U7], [A5,L2,B20,U7], [A5,L14,B20,U8], [A5,L2,B20,U8], [A5,L14,B20,U9], [A5,L2,B20,U9]]
 *
 * then 1 for #5:
 * [[A5,L14,B20,U7,M13], [A5,L2,B20,U7,M13], [A5,L14,B20,U8,M13], [A5,L2,B20,U8,M13], [A5,L14,B20,U9,M13], [A5,L2,B20,U9,M13]]
 *
 * @param possibleLetters
 */
function buildWordChains(possibleLetters: Letter[][]) {
	let builtChains: Letter[][] = [[]]

	for (let i = 0; i < possibleLetters.length; i++) {
		const newBuiltChains: Letter[][] = []

		for (const chain of builtChains) {
			const newChains: Letter[][] = []

			// For each of the new possible letters (U7, 8, 9)
			// check if it's already been used in the old chain,
			// if not, add it on to a copy of the old chain
			for (const possibleLetter of possibleLetters[i]) {
				let used = false
				for (const l of chain) {
					if (possibleLetter.index === l.index) {
						used = true
						break
					}
				}

				if (!used) {
					newChains.push([...chain, possibleLetter])
				}
			}

			// If for some reason there isn't a possible letter, just repush the chain, we'll filter it out later
			if (possibleLetters[i].length === 0) {
				newChains.push([...chain])
			}

			newBuiltChains.push(...newChains)
		}

		builtChains = newBuiltChains
	}

	return builtChains
}

export const actualizeWord = (word: string, letters: Letter[], indices: number[]) => {
	const possibleLetters = getPossibleLetters(word, letters, indices)
	return buildWordChains(possibleLetters)
}

export const getActualizedWords = (words: string[], letters: Letter[], indices: number[]) => {
	const actualizedWords = []

	for (const word of words) {
		const actualizedWord: Letter[][] = actualizeWord(word, letters, indices)
		actualizedWords.push(...actualizedWord)
	}

	// Filter out words with missing possible letters.
	// Currently, this happens often with considering crossingYellows. We put them in the pool no matter what so they don't
	// get filtered out of the word list (maybe they should), but they get filtered out when we try to actually
	// make them and they fail

	// You can see this if you debug testGame[0] where in the word BSMCY, we try to create the word BIRSY by using
	// S^6. S^6 is in the pool for that word but _only_ if it goes in the middle position (index 2)
	return actualizedWords.filter((w) => w.length === 5)
}

export const getRandomActualization = (l: string, actualizedWords: Letter[][]): Letter[] => {
	const actualizedStrings = actualizedWords.map((w) => w.map((l) => l.letter).join(''))

	const matchingActualizations = []
	for (let i = 0; i < actualizedStrings.length; i++) {
		if (actualizedStrings[i] === l) {
			matchingActualizations.push(i)
		}
	}

	return actualizedWords[matchingActualizations[Math.floor(Math.random() * matchingActualizations.length)]]
}
