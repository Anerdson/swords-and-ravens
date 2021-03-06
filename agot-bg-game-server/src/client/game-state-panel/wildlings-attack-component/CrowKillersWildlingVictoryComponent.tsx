import {observer} from "mobx-react";
import {Component, ReactNode} from "react";
import GameStateComponentProps from "../GameStateComponentProps";
import renderChildGameState from "../../utils/renderChildGameState";
import SelectUnitsGameState from "../../../common/ingame-game-state/select-units-game-state/SelectUnitsGameState";
import SelectUnitsComponent from "../SelectUnitsComponent";
import CrowKillersWildlingVictoryGameState
    from "../../../common/ingame-game-state/westeros-game-state/wildlings-attack-game-state/crow-killers-wildling-victory-game-state/CrowKillersWildlingVictoryGameState";
import Col from "react-bootstrap/Col";
import React from "react";

@observer
export default class CrowKillersWildlingVictoryComponent extends Component<GameStateComponentProps<CrowKillersWildlingVictoryGameState>> {
    render(): ReactNode {
        return (
            <>
                <Col xs={12}>
                    <b>{this.props.gameState.childGameState.house.name}</b> replaces {this.props.gameState.childGameState.count} of their Knights with
                    available Footmen.
                </Col>
                {renderChildGameState(this.props, [
                    [SelectUnitsGameState, SelectUnitsComponent]
                ])}
            </>
        );
    }
}
