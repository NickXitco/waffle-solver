import { Letter, Mode } from './types'
import React, { FC } from 'react'
import styles from './app.module.scss'
import { getColor, getTextColor } from './colorUtils'

export const WaffleSpacer = (props: { index: number }) => {
	return <div key={`spacer${props}`} />
}

export interface LetterProps extends Letter {
	onChange: (letter: string) => void
	advanceState: () => void
	mode: Mode
}
export const WaffleLetter: FC<LetterProps> = (props) => {
	const state = props.state
	const id = `letter${props.index}`

	return (
		<div
			key={id}
			className={styles.input_wrapper}
			onClick={() => {
				if (props.mode === Mode.COLORING) {
					props.advanceState()
				}
			}}
		>
			<sup className={styles.index}>{props.index}</sup>
			<input
				className={styles.letter_chiclet}
				type="text"
				id={id}
				maxLength={1}
				disabled={props.mode === Mode.COLORING}
				style={{ background: getColor(state), color: getTextColor(state) }}
				value={props.letter}
				onChange={(e) => {
					e.preventDefault()
					props.onChange(e.target.value)
				}}
			/>
		</div>
	)
}
