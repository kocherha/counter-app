import { useReducer } from "react";
import "./styles.css";
const { ipcRenderer } = window.require("electron");


interface State {
    count: number | undefined;
};

type CounterAction =
    {type: "setCounter"; value: State["count"];};


const initialState: State = {count: NaN};

const reducer = (state: State, action: CounterAction): State => {
    switch (action.type) {
        case "setCounter":
            return { ...state, count: action.value };
        default:
            throw new Error("Unknown action");
    }
};

const prettyState = (state: State): string => {
    if (typeof state.count === "number") {
        return isNaN(state.count) ? "?" : String(state.count);
    }
    return "Error";
}


////////////////////////////////////////////////////////////////////////////////

let setCounter = (value: number | undefined) => {};


ipcRenderer.send("init-counter");

const handleDecCounter = () => {
    ipcRenderer.send("set-counter", -1);
};
const handleIncCounter = () => {
    ipcRenderer.send("set-counter", 1);
};
const handleResetCounter = () => {
    ipcRenderer.send("reset-counter");
};

ipcRenderer.on( "set-counter", (event: any, value: number) => {
    setCounter(value);
});
ipcRenderer.on( "set-error", (event: any) => {
    setCounter(undefined);
});


////////////////////////////////////////////////////////////////////////////////

export default function App(): React.JSX.Element {
    const [state, dispatch] = useReducer(reducer, initialState);
    setCounter = (value: number | undefined) =>
        dispatch({type: "setCounter", value});

    return (
        <div
            id={"content-wrapper"}
            className={"flex column vertical-align horizontal-align"}
        >

            <h1>Counter using Hooks & IPC</h1>

            <div
                id={"counter-wrapper"}
                className={"flex column vertical-align justify-sp-ev"}
            >
                <div className={"flex column vertical-align"}>

                    <p>{prettyState(state)}</p>

                    <div className={"flex row justify-sp-ar mt-10"}>
                        <button className={"mr-5"} onClick={handleDecCounter}>
                            -1
                        </button>

                        <button onClick={handleIncCounter}>
                            +1
                        </button>
                    </div>

                </div>

                <button id={"counter-reset"} onClick={handleResetCounter}>
                    Reset Counter
                </button>
            </div>

        </div>
    );
}
