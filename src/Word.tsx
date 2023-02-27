import styles from './app.module.scss'
import { getColor, getTextColor } from './colorUtils'
import React, { FC } from 'react'
import { Letter } from './types'
import { wordMappings } from './constants'
import {
	findPossibleWords,
	getActualizedWords,
	getDefiniteGreens,
	getDefiniteGreys,
	getDefiniteYellows,
	getLettersInWordPool,
	getRandomActualization,
	getUncertainYellows,
} from './wordUtils'

interface WordProps {
	word: number
	letters: Letter[]
	actualizeWord: (indices: number[], word: Letter[]) => void
}

export const Word: FC<WordProps> = (props) => {
	const { word, letters } = props
	const indices = wordMappings[word]

	const pool = getLettersInWordPool(letters, indices).sort((a, b) => a.index - b.index)

	const definiteGreens = getDefiniteGreens(letters, indices)
	const definiteYellows = getDefiniteYellows(letters, indices)
	const uncertainYellows = getUncertainYellows(letters, indices)
	const definiteGreys = getDefiniteGreys(letters, indices)

	const definiteLetters = [...definiteGreens, ...definiteYellows].sort((a, b) => a.pos - b.pos)
	const definiteExclusions = [...definiteGreys, ...uncertainYellows].sort((a, b) => a.pos - b.pos)

	const possibleWords = findPossibleWords(letters, indices)
	const actualizedWords = getActualizedWords(possibleWords, letters, indices)

	const actualizedStrings = actualizedWords.map((w) => w.map((l) => l.letter).join(''))
	const filteredPossibleWords = possibleWords.filter((w) => actualizedStrings.includes(w))

	return (
		<li className={styles.word_container}>
			<div className={styles.word}>
				{indices.map((l) => {
					const letter = letters[l]

					return (
						<div
							className={styles.letter_chiclet}
							key={`letter${letter.index}`}
							style={{ background: getColor(letter.state), color: getTextColor(letter.state) }}
						>
							<sup className={styles.index}>{letter.index}</sup>
							{letter.letter}
						</div>
					)
				})}
			</div>
			<div className={styles.pool_analysis}>
				<p>Pool:</p>
				<ul className={styles.word_pool}>
					{pool.map((l) => (
						<li style={{ color: getColor(l.state) }} key={l.index}>
							{l.letter}
							<sup>{l.index}</sup>
						</li>
					))}
				</ul>
			</div>

			<div className={styles.pool_analysis}>
				<p>Definite Letters:</p>
				<ul className={styles.word_pool}>
					{definiteLetters.map((l) => (
						<li style={{ color: getColor(l.state) }} key={l.index}>
							{l.letter}
							<sup>
								{l.index}, {l.pos}
							</sup>
						</li>
					))}
				</ul>
			</div>

			<div className={styles.pool_analysis}>
				<p>Definite Exclusions:</p>
				<ul className={styles.word_pool}>
					{definiteExclusions.map((l) => (
						<li style={{ color: getColor(l.state) }} key={l.index}>
							{l.letter}
							<sup>
								{l.index}, {l.pos}
							</sup>
						</li>
					))}
				</ul>
			</div>

			<div className={styles.pool_analysis}>
				<p>Possible Words ({filteredPossibleWords.length}):</p>
				<ul className={styles.actualized_list}>
					{filteredPossibleWords.map((l) => (
						<li key={l}>
							<button
								onClick={() => props.actualizeWord(indices, getRandomActualization(l, actualizedWords))}
							>
								{l}
							</button>
						</li>
					))}
				</ul>
			</div>

			<div className={styles.pool_analysis}>
				<p>Actualized Words ({actualizedWords.length}):</p>
				<ul className={styles.actualized_list}>
					{actualizedWords.map((w, i) => (
						<li key={i}>
							<button onClick={() => props.actualizeWord(indices, w)}>
								{w.map((l) => (
									<span key={l.index}>
										{l.letter}
										<sup>{l.index}</sup>
									</span>
								))}
							</button>
						</li>
					))}
				</ul>
			</div>
		</li>
	)
}
