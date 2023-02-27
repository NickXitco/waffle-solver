import { LetterState, StateColors } from './types'

export const getColor = (state: LetterState) => {
	switch (state) {
		case LetterState.UNKNOWN:
			return StateColors.Unknown
		case LetterState.GREY:
			return StateColors.Grey
		case LetterState.YELLOW:
			return StateColors.Yellow
		case LetterState.GREEN:
			return StateColors.Green
	}

	return StateColors.Grey
}

export const getTextColor = (state: LetterState) => {
	if (state === LetterState.GREY) {
		return 'black'
	}

	return 'white'
}
