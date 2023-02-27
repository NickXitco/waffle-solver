import { Letter, LetterWithWordPos } from './types'
import { MASTER_WORD_LIST } from './constants'

export const filterBasedOnGreens = (definiteGreens: LetterWithWordPos[]) => {
	return MASTER_WORD_LIST.filter((word) => {
		for (const letter of definiteGreens) {
			if (word.at(letter.pos) !== letter.letter) {
				return false
			}
		}

		return true
	})
}

export const filterBasedOnDefiniteYellows = (possibleWords: string[], definiteYellows: LetterWithWordPos[]) => {
	return possibleWords.filter((word) => {
		for (const letter of definiteYellows) {
			if (word.at(letter.pos) === letter.letter) {
				return false
			}

			if (!word.includes(letter.letter)) {
				return false
			}
		}

		return true
	})
}

export const filterBasedOnGreys = (possibleWords: string[], definiteGreys: LetterWithWordPos[]) => {
	return possibleWords.filter((word) => {
		for (const letter of definiteGreys) {
			if (word.at(letter.pos) === letter.letter) {
				return false
			}
		}

		return true
	})
}

export const filterBasedOnUncertainYellows = (possibleWords: string[], uncertainYellows: LetterWithWordPos[]) => {
	return possibleWords.filter((word) => {
		for (const letter of uncertainYellows) {
			if (word.at(letter.pos) === letter.letter) {
				return false
			}
		}

		return true
	})
}

export const filterBasedOnPool = (pool: Letter[], possibleWords: string[]) => {
	const poolLetters = pool.map((l) => l.letter)

	return possibleWords.filter((word) => {
		const poolBank: { [key: string]: number } = {}
		for (const letter of poolLetters) {
			poolBank[letter] = poolBank[letter] ? poolBank[letter] + 1 : 1
		}

		for (const letter of word) {
			const bankValue = poolBank[letter]
			if (!bankValue) {
				return false
			}

			poolBank[letter]--
		}

		return true
	})
}
