import * as PIXI from 'pixi.js'
import moment from 'moment'


const app = new PIXI.Application({ backgroundColor: 0x1099bb});
app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'
app.renderer.resize(window.innerWidth, window.innerHeight);
document.body.appendChild(app.view);


const grid = [
    ['I', 'T', 'L', 'I', 'S', 'A', 'S', 'A', 'M', 'P', 'M'],
    ['A', 'C', 'Q', 'U', 'A', 'R', 'T', 'E', 'R', 'D', 'C'],
    ['T', 'W', 'E', 'N', 'T', 'Y', 'F', 'I', 'V', 'E', 'X'],
    ['H', 'A', 'L', 'F', 'S', 'T', 'E', 'N', 'F', 'T', 'O'],
    ['P', 'A', 'S', 'T', 'E', 'R', 'U', 'N', 'I', 'N', 'E'],
    ['O', 'N', 'E', 'S', 'I', 'X', 'T', 'H', 'R', 'E', 'E'],
    ['F', 'O', 'U', 'R', 'F', 'I', 'V', 'E', 'T', 'W', 'O'],
    ['E', 'I', 'G', 'H', 'T', 'E', 'L', 'E', 'V', 'E', 'N'],
    ['S', 'E', 'V', 'E', 'N', 'T', 'W', 'E', 'L', 'V', 'E'],
    ['T', 'E', 'N', 'S', 'E', 'O', 'C', 'L', 'O', 'C', 'K']
]

const wordStarts: {[key: string]: [number, number, number]} = {
    'IT': [0, 0, 2],
    'IS': [0, 3, 2],
    'A': [1, 0, 1],
    'QUARTER': [1, 2, 7],
    'TWENTY': [2, 0, 6],
    'FIVE': [2, 6, 4],
    'HALF': [3, 0, 4],
    'TEN': [3, 5, 3],
    'TO': [3, 9, 2],
    'PAST': [4, 0, 4],
    'NINE_HOUR': [4, 7, 4],
    'ONE_HOUR': [5, 0, 3],
    'SIX_HOUR': [5, 3, 3],
    'THREE_HOUR': [5, 6, 5],
    'FOUR_HOUR': [6, 0, 4],
    'FIVE_HOUR': [6, 4, 4],
    'TWO_HOUR': [6, 8, 3],
    'EIGHT_HOUR': [7, 0, 5],
    'ELEVEN_HOUR': [7, 5, 6],
    'SEVEN_HOUR': [8, 0, 5],
    'TWELVE_HOUR': [8, 5, 6],
    'TEN_HOUR': [9, 0, 3],
    'OCLOCK': [9, 5, 6]
}

const container = new PIXI.Container()

let x = 0, y = 0
const pixiTexts: PIXI.Text[][] = []
for (let i = 0; i < grid.length; i++) {
    y += 40
    x = 0
    pixiTexts.push([])
    const row = grid[i]
    for (const val of row) {
        x += 40
        let adjust = 0
        if (val === 'I') {
            adjust = 5
            x += adjust
        }
        const ch = new PIXI.Text(val)
        ch.x = x
        ch.y = y
        x -= adjust
        container.addChild(ch)
        pixiTexts[i].push(ch)
    }
}

app.stage.addChild(container)

// Move container to the center
container.x = app.screen.width / 2 - 250;
container.y = app.screen.height / 2 - 220;



const roundToNearestFive = (val: number): number => {
    const rem = val % 5
    if (rem === 0 || rem === 5) {
        return val
    }

    if (rem > 2) {
        return val + 5 - rem
    } else {
        return val - rem
    }
}

const getDescriptorWordStarts = (val: number): [number, number, number][] => {
    const res = []
    switch (val) {
        case 5:
            res.push(wordStarts['FIVE'])
            break
        case 10:
            res.push(wordStarts['TEN'])
            break
        case 15:
            res.push(wordStarts['A'], wordStarts['QUARTER'])
            break
        case 20:
            res.push(wordStarts['TWENTY'])
            break
        case 25:
            res.push(wordStarts['TWENTY'], wordStarts['FIVE'])
            break
        case 30:
            res.push(wordStarts['HALF'])
            break
        case 35:
            res.push(wordStarts['TWENTY'], wordStarts['FIVE'])
            break
        case 40:
            res.push(wordStarts['TWENTY'])
            break
        case 45:
            res.push(wordStarts['A'], wordStarts['QUARTER'])
            break
        case 50:
            res.push(wordStarts['TEN'])
            break
        case 55:
            res.push(wordStarts['FIVE'])
            break
    }
    if (val > 2 && val <= 30) {
        res.push(wordStarts['PAST'])
    } else if (val > 30 && val <= 57) {
        res.push(wordStarts['TO'])
    } else if (val > 57 || val <= 2) {
        res.push(wordStarts['OCLOCK'])
    }
    return res
}

const getWordStart = (hourVal: number, minuteVal: number): [number, number, number] => {
    if (minuteVal >= 35) {
        hourVal += 1
    }
    if (hourVal > 12) {
        hourVal -= 12
    } else if (hourVal === 0) {
        hourVal = 12
    }
    const valToString = [
        'ONE',
        'TWO',
        'THREE',
        'FOUR',
        'FIVE',
        'SIX',
        'SEVEN',
        'EIGHT',
        'NINE',
        'TEN',
        'ELEVEN',
        'TWELVE'
    ]
    return wordStarts[valToString[hourVal - 1] + '_HOUR']
}

const buildWordStartList = (time: moment.Moment) => {
    let result = [wordStarts['IT'], wordStarts['IS']]
    const hour = time.get('hour')
    const minute = roundToNearestFive(time.get('minute'))
    result.push(getWordStart(hour, minute))
    const descriptorWordStarts = getDescriptorWordStarts(minute)
    for (const start of descriptorWordStarts) {
        result.push(start)
    }
    return result
}

const highlightLetters = (wordStartList: [number, number, number][]) => {
    for (const wordStart of wordStartList) {
        const length = wordStart[2]
        for (let i = wordStart[1]; i < wordStart[1] + length; i++) {
            const t = pixiTexts[wordStart[0]][i]
            t.style.fill = '#ffffff'
        }
    }
}

const resetGrid = () => {
    for (const row of pixiTexts) {
        for (const text of row) {
            text.style.fill = '#000000'
        }
    }
}

const wordStartList = buildWordStartList(moment())
resetGrid()
highlightLetters(wordStartList)


const onResize = () => {
    // Move container to the center
    app.renderer.resize(window.innerWidth, window.innerHeight);
    container.x = app.screen.width / 2 - 250;
    container.y = app.screen.height / 2 - 220;
}

setInterval(() => {
    const wordStartList = buildWordStartList(moment())
    resetGrid()
    highlightLetters(wordStartList)
}, 15000)

window.onresize = onResize


