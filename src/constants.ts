import WORDS from './words.json'

export const MASTER_WORD_LIST = WORDS.words

export const wordMappings = [
	[0, 1, 2, 3, 4],
	[8, 9, 10, 11, 12],
	[16, 17, 18, 19, 20],
	[0, 5, 8, 13, 16],
	[2, 6, 10, 14, 18],
	[4, 7, 12, 15, 20],
]

export const definiteYellowIndices = [1, 3, 5, 6, 7, 9, 11, 13, 14, 15, 17, 19]

// Format is <Letter><0 = Grey | 1 = Yellow | 2 = Green>
export const testGames = [
	'B2S0M1C0Y2E1S1E1A1I0A2R0S1L0L1A0D2E0E2K0S2',
	'C2A1E1H1M2R2N0A2G0A1G2R1L0U0L1A0E2R0U0R0Y2',
	'M2A2S1D0R2O0E0G1Y0D1U2O0I1R0R2I0C2T1A1I0E2',
	'S2L0R1O0P2A0M0O2R1O1D2C0H0T0R0O0N2T1R2E0H2',
]
