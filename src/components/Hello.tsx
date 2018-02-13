import * as React from "react";

import { load, evaluateFull, MarkovChain } from "quicktype/dist/MarkovChain";

interface MarkovDisplayProps { word: string; }

let markovChain: MarkovChain | undefined = undefined;
function getMarkovChain(): MarkovChain {
    if (markovChain === undefined) {
        markovChain = load();
    }
    return markovChain;
}

function colorForScore(score: number): string {
    const g = Math.floor(Math.min(Math.sqrt(score / 0.3) * 255, 255));
    const r = 255 - g;
    return `rgb(${r.toString()},${g.toString()},33)`;
}

class MarkovDisplay extends React.Component<MarkovDisplayProps, {}> {
    constructor(props: MarkovDisplayProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const mc = getMarkovChain();
        const scores = evaluateFull(mc, this.props.word);
        console.log(scores);
        const cells: [string, string][] = [];
        for (let i = 0; i < this.props.word.length; i++) {
            const c = this.props.word.charAt(i);
            let color: string;
            if (i >= mc.depth - 1) {
                const score = scores[1][i - mc.depth + 1];
                color = colorForScore(score);
            } else {
                color = "white";
            }
            cells.push([c, color]);
        }
        return <table><tr>{cells.map(([c, color]) => <td style={ { border: "1px solid black", backgroundColor: color } }>{c}</td>)}</tr></table>;
    }
}

interface HelloState { word: string; };

export class Hello extends React.Component<{}, HelloState> {
    constructor() {
        super({});
        this.state = { word: "property" };
    }

    private handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ word: event.target.value });
    }

    public render(): React.ReactNode {
        return <form>
                <MarkovDisplay word={this.state.word} />
                <br />
                <input value={this.state.word} onChange={e => this.handleChange(e)} />
            </form>;
    }
}