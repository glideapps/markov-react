import * as React from "react";

import { load, evaluateFull, MarkovChain, generate } from "quicktype/dist/MarkovChain";

interface MarkovDisplayProps { cells: [string, string][]; }

let markovChain: MarkovChain | undefined = undefined;
function getMarkovChain(): MarkovChain {
    if (markovChain === undefined) {
        markovChain = load();
    }
    return markovChain;
}

function colorForScore(score: number): string {
    const s = Math.min(Math.pow(score / 0.3, 1/3), 1.0);
    let r, g: number;
    if (s < 0.5) {
        r = 255;
        g = Math.floor(s * 2 * 255);
    } else {
        r = Math.floor(255 - (s - 0.5) * 2 * 255);
        g = 255;
    }
    return `rgb(${r.toString()},${g.toString()},33)`;
}

class MarkovDisplay extends React.Component<MarkovDisplayProps, {}> {
    constructor(props: MarkovDisplayProps) {
        super(props);
    }

    public render(): React.ReactNode[] {
        const cells = this.props.cells;
        return cells.map(([c, color]) => <td style={{ border: "1px solid black", backgroundColor: color }}>{c}</td>);
    }
}

interface HelloState { word: string; };

export class Hello extends React.Component<{}, HelloState> {
    constructor() {
        super({});
        this.state = { word: "property" };
    }

    private append(s: string): void {
        console.log("appending", s);
        this.setState({ word: this.state.word + s });
    }

    private handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.append(event.target.value);
    }

    private handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
        const l = this.state.word.length;
        if (l === 0) return;
        if (event.keyCode === 8) {
            this.setState({ word: this.state.word.slice(0, l - 1) });
        }
    }

    private handleGenerate(): void {
        const mc = getMarkovChain();
        const word = this.state.word;
        const l = word.length;
        if (l < mc.depth - 1) return;
        const state = word.slice(l - mc.depth + 1);
        console.log("state is", state);
        this.append(generate(mc, state, 0.001));
    }

    public render(): React.ReactNode {
        const mc = getMarkovChain();
        const word = this.state.word;
        const [totalScore, charScores] = evaluateFull(mc, word);
        const cells: [string, string][] = [];
        for (let i = 0; i < word.length; i++) {
            const c = word.charAt(i);
            let color: string;
            if (i >= mc.depth - 1) {
                const score = charScores[i - mc.depth + 1];
                color = colorForScore(score);
            } else {
                color = "white";
            }
            cells.push([c, color]);
        }

        return <form>
            <table style={{ padding: "5px", backgroundColor: colorForScore(totalScore) }}><tr>
                <MarkovDisplay cells={cells} />
                <td><input size={1} value="" onChange={e => this.handleChange(e)} onKeyDown={e => this.handleKeyDown(e)} /></td>
            </tr></table>
            <button type="button" onClick={e => this.handleGenerate()} >Generate</button>
        </form>;
    }
}