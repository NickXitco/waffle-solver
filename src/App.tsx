import React, { Fragment, useState } from 'react'
import styles from './app.module.scss'
import { Letter, LetterState, Mode } from './types'
import { testGames } from './constants'
import { Word } from './Word'
import { WaffleLetter, WaffleSpacer } from './WaffleComponents'
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

const App = () => {
	const [letters, setLetters] = useState(getLettersFromGameString(testGames[3]))
	const [mode, setMode] = useState(Mode.INPUT)

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
