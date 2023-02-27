import React, { Fragment, useEffect, useState } from 'react'
import styles from './app.module.scss'
import { Letter, LetterState, Mode } from './types'
import { Word } from './Word'
import { WaffleLetter, WaffleSpacer } from './WaffleComponents'
import { wordMappings } from './constants'

const getLettersFromGameString = (s: string) => {
	const letters: Letter[] = []
	for (let i = 0; i < s.length; i += 2) {
		letters.push({
			letter: s[i].toLowerCase(),
			index: i / 2,
			state: parseInt(s[i + 1]) as LetterState,
		})
	}
	return letters
}

const getEmptyBoard = () => {
	const letters: Letter[] = []
	for (let i = 0; i < 21; i++) {
		letters.push({
			letter: ' ',
			index: i,
			state: LetterState.GREY,
		})
	}
	return letters
}

function decodeUTF16LE(encodedString: string) {
	var decodedString = ''
	for (var i = 0; i < encodedString.length; i += 2) {
		var charCode = encodedString.charCodeAt(i) | (encodedString.charCodeAt(i + 1) << 8)
		decodedString += String.fromCharCode(charCode)
	}
	return decodedString
}

const getLettersFromWaffleSite = async () => {
	const url = 'https://corsproxy.io/?' + encodeURIComponent('https://wafflegame.net/daily1.txt')

	const data = await fetch(url).then((res) => res.text())

	// Decode base64 string to binary data
	const binaryData = window.atob(data)

	// Convert binary data to UTF-16 string
	let utf16String = ''
	for (let i = 0; i < binaryData.length; i += 2) {
		utf16String += String.fromCharCode(binaryData.charCodeAt(i) | (binaryData.charCodeAt(i + 1) << 8))
	}

	// Convert UTF-16 string to regular JavaScript string
	const puzzleSetup = JSON.parse(utf16String.replace(/^\uFEFF/, ''))
	const puzzleBoard = puzzleSetup.puzzle.toLowerCase()
	const solution = puzzleSetup.solution.toLowerCase()
	console.log(puzzleSetup)

	const letters: Letter[] = []
	for (let i = 0; i < puzzleBoard.length; i++) {
		letters.push({
			letter: puzzleBoard[i],
			index: i,
			state: solution[i] === puzzleBoard[i] ? LetterState.GREEN : LetterState.GREY,
		})
	}

	/*
	TODO this is incomplete and doesn't consider multiple of the same letter in one word, or crossing yellows. It's complicated
	 */
	for (let i = 0; i < wordMappings.length; i++) {
		const wordMapping = wordMappings[i]
		const solution: string = puzzleSetup.words[i].toLowerCase()

		for (let j = 0; j < wordMapping.length; j++) {
			const letter = letters[wordMapping[j]]
			if (solution.includes(letter.letter) && solution[j] !== letter.letter) {
				letter.state = LetterState.YELLOW
			}
		}
	}

	return letters
}

const App = () => {
	const [fetched, setFetched] = useState(false)
	const [letters, setLetters] = useState(getEmptyBoard())
	const [mode, setMode] = useState(Mode.INPUT)

	useEffect(() => {
		if (!fetched) {
			getLettersFromWaffleSite().then((r) => {
				setLetters(r)
				setFetched(true)
			})
		}
	})

	const updateLetter = (index: number, newLetter: string) => {
		const nextLetters = letters.map((l, i) => {
			if (i === index) {
				return {
					...l,
					letter: newLetter.toLowerCase(),
				}
			} else {
				return l
			}
		})
		setLetters(nextLetters)
	}

	const updateState = (index: number) => {
		const nextLetters = letters.map((l, i) => {
			if (i === index) {
				return {
					...l,
					state: (l.state + 1) % 3,
				}
			} else {
				return l
			}
		})
		setLetters(nextLetters)
	}

	const updateLetters = (newLetters: Letter[]) => {
		const nextLetters = letters.map((l, i) => {
			for (const l of newLetters) {
				if (i === l.index) {
					return {
						...l,
						letter: l.letter,
						state: l.state,
					}
				}
			}

			return l
		})
		setLetters(nextLetters)
	}

	const actualizeWord = (indices: number[], word: Letter[]) => {
		const originalLetters = indices.map((i) => letters[i])

		const originalIndices = indices
		const newIndices = word.map((a) => a.index)

		const bumps = originalIndices.filter((a) => !newIndices.includes(a))
		const imports = newIndices.filter((a) => !originalIndices.includes(a))
		const updates: Letter[] = []

		for (let i = 0; i < word.length; i++) {
			const originalLetter = originalLetters[i]
			const newLetter = word[i]

			updates.push({
				index: originalLetter.index,
				letter: newLetter.letter,
				state: LetterState.GREEN,
			})
		}

		// move bumps to imports

		for (let i = 0; i < bumps.length; i++) {
			updates.push({
				index: imports[i],
				letter: letters[bumps[i]].letter,
				state: LetterState.UNKNOWN,
			})
		}

		/*

		TODO

		suppose we have a word RIDGE placed on the board like

		R G I I E
		where the R and E are green, the G and *first* I are yellow, and the second I is grey

		if we actualize a word that crosses with that middle I, then that I will be pulled out of the word and pool,
		rightly so. However, since that I was yellow and it was pulled out of the word, any other letters in the
		word that are the same letter (the second I), should be updated to an unknown state.

		In this case, the second I should be set to yellow, but it's not, it's kept as grey, which means it's
		removed from the pool and the word can no longer be solved.

		We can do this by checking if a letter L in the new word *was* a yellow. If it was, then any grey letter in its
		original word with the same letter L needs to be set to unknown.

		 */

		updateLetters(updates)
	}

	return (
		<div className={styles.app}>
			<header className={styles.app_header}>
				<h1>WAFFLE SOLVER</h1>
			</header>

			<input
				type={'checkbox'}
				checked={mode === Mode.INPUT}
				onChange={(e) => {
					setMode(e.target.checked ? Mode.INPUT : Mode.COLORING)
				}}
			/>

			<div className={styles.wrapper}>
				<div>
					<h2>Grid</h2>
					<div className={styles.input_grid}>
						{/*
							TODO

							Do this input like those fancy OTP inputs where you have the boxes that look like they're
							the input but actually it's a hidden <input type='text'/> with clever spacing that
							updates the values of the boxes.

							See shoppay for this.


							 */}
						{letters.map((letter, i) => {
							const addSpacer = i === 5 || i === 6 || i === 13 || i === 14

							return (
								<Fragment key={i}>
									<WaffleLetter
										{...letters[i]}
										onChange={(letter: string) => updateLetter(i, letter)}
										advanceState={() => updateState(i)}
										mode={mode}
									/>
									{addSpacer && <WaffleSpacer index={i} />}
								</Fragment>
							)
						})}
					</div>
				</div>

				<div className={styles.words}>
					<h2>Words</h2>
					<ul className={styles.words_list}>
						<Word word={0} letters={letters} actualizeWord={actualizeWord} />
						<Word word={1} letters={letters} actualizeWord={actualizeWord} />
						<Word word={2} letters={letters} actualizeWord={actualizeWord} />
						<Word word={3} letters={letters} actualizeWord={actualizeWord} />
						<Word word={4} letters={letters} actualizeWord={actualizeWord} />
						<Word word={5} letters={letters} actualizeWord={actualizeWord} />
					</ul>
				</div>
			</div>
		</div>
	)
}

export default App
