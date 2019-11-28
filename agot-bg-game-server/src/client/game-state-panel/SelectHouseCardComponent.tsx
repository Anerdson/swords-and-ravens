import {Component, ReactNode} from "react";
import GameStateComponentProps from "./GameStateComponentProps";
import SelectUnitsGameState from "../../common/ingame-game-state/select-units-game-state/SelectUnitsGameState";
import Region from "../../common/ingame-game-state/game-data-structure/Region";
import Unit from "../../common/ingame-game-state/game-data-structure/Unit";
import _ from "lodash";
import * as React from "react";
import {Row} from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import BetterMap from "../../utils/BetterMap";
import {observable} from "mobx";
import {observer} from "mobx-react";
import SelectHouseCardGameState
    from "../../common/ingame-game-state/select-house-card-game-state/SelectHouseCardGameState";
import HouseCard from "../../common/ingame-game-state/game-data-structure/house-card/HouseCard";
import HouseCardComponent from "./utils/HouseCardComponent";

@observer
export default class SelectHouseCardComponent extends Component<GameStateComponentProps<SelectHouseCardGameState<any>>> {
    @observable selectedHouseCard: HouseCard | null;

    render(): ReactNode {
        return (
            <>
                <Col xs={12}>
                    {this.props.gameClient.doesControlHouse(this.props.gameState.house) ? (
                        <Row className="justify-content-center">
                            <Col xs="12">
                                <Row className="justify-content-center">
                                    {this.props.gameState.houseCards.map(hc => (
                                        // The house argument is used to decide which card-back is used
                                        // Since we will never show a back-card here, we can give whatever value fits.
                                        <HouseCardComponent
                                            houseCard={hc}
                                            placement="auto"
                                            house={this.props.gameState.house}
                                            selected={this.selectedHouseCard == hc}
                                            onClick={() => this.selectedHouseCard != hc ? this.selectedHouseCard = hc : this.selectedHouseCard = null}
                                        />
                                    ))}
                                </Row>
                            </Col>
                            <Col xs="auto">
                                <Button onClick={() => this.confirm()} disabled={this.selectedHouseCard == null}>
                                    Confirm
                                </Button>
                            </Col>
                        </Row>
                    ) : (
                        <div className="text-center">
                            Waiting for {this.props.gameState.house.name}...
                        </div>
                    )}
                </Col>
            </>
        );
    }

    confirm(): void {
        if (!this.selectedHouseCard) {
            return;
        }

        this.props.gameState.select(this.selectedHouseCard);
    }
}