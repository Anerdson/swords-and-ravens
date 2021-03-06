import {Component, ReactNode} from "react";
import ResolveSingleMarchOrderGameState
    from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/resolve-single-march-order-game-state/ResolveSingleMarchOrderGameState";
import React from "react";
import {observable} from "mobx";
import Region from "../../common/ingame-game-state/game-data-structure/Region";
import Unit from "../../common/ingame-game-state/game-data-structure/Unit";
import * as _ from "lodash";
import {observer} from "mobx-react";
import {Button, Form} from "react-bootstrap";
import BetterMap from "../../utils/BetterMap";
import GameStateComponentProps from "./GameStateComponentProps";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import {OrderOnMapProperties, RegionOnMapProperties, UnitOnMapProperties} from "../MapControls";
import PartialRecursive from "../../utils/PartialRecursive";


@observer
export default class ResolveSingleMarchOrderComponent extends Component<GameStateComponentProps<ResolveSingleMarchOrderGameState>> {
    @observable selectedMarchOrderRegion: Region | null;
    @observable selectedUnits: Unit[] = [];
    @observable plannedMoves = new BetterMap<Region, Unit[]>();
    @observable leavePowerToken = false;

    modifyRegionsOnMapCallback: any;
    modifyUnitsOnMapCallback: any;
    modifyOrdersOnMapCallback: any;

    render(): ReactNode {
        return (
            <>
                <Col xs={12} className="text-center">
                    House <b>{this.props.gameState.house.name}</b> must resolve one of
                    its March Orders.
                </Col>
                {this.props.gameClient.doesControlHouse(this.props.gameState.house) ? (
                    <>
                        <Col xs={12} className="text-center">
                            {this.selectedMarchOrderRegion == null ? (
                                "Click on one of your March Orders."
                            ) : this.selectedUnits.length == 0 ? (
                                "Click on a subset of the troops in the marching region."
                            ) : (
                                "Click on a neighbouring region, or click on other units of the marching region."
                            )}
                        </Col>
                        {this.plannedMoves.size > 0 && (
                            <Col xs={12} className="text-center">
                                {this.plannedMoves.entries.map(([region, units]) => (
                                    <div key={region.id}>
                                        {units.map(u => u.type.name).join(", ")} =&gt; {region.name}
                                    </div>
                                ))}
                            </Col>
                        )}
                        {this.selectedMarchOrderRegion != null && (
                            <>
                                {this.renderLeavePowerToken(this.selectedMarchOrderRegion)}
                                <Col xs={12}>
                                    <Row className="justify-content-center">
                                        <Col xs="auto">
                                            <Button onClick={() => this.confirm()}>
                                                Confirm
                                            </Button>
                                        </Col>
                                        <Col xs="auto">
                                            <Button
                                                variant="danger"
                                                onClick={() => this.reset()}
                                            >
                                                Cancel
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </>
                        )}
                    </>
                ) : (
                    <Col xs={12} className="text-center">
                        Waiting for {this.props.gameState.house.name}...
                    </Col>
                )}
            </>
        );
    }

    renderLeavePowerToken(startingRegion: Region): ReactNode | null {
        const {success, reason} = this.props.gameState.canLeavePowerToken(
            startingRegion,
            this.plannedMoves
        );

        return (
            <Col xs={12} className="text-center">
                <OverlayTrigger overlay={
                    <Tooltip id={"leave-power-token"}>
                        {reason == "already-capital" ? (
                            <>Your capital is always controlled by your house, thus not requiring a Power
                                token to be left when leaving the area to keep control of it.</>
                        ) : reason == "already-power-token" ? (
                            <>A Power token is already present.</>
                        ) : reason == "no-power-token-available" ? (
                            "You don't have any available Power token."
                        ) : reason == "not-a-land" ? (
                            "Power tokens can only be left on land areas."
                        ) : reason == "no-all-units-go" ? (
                            "All units must leave the area in order to leave a Power token."
                        ) : "Leaving a Power token in an area maintain the control your house has on it, even"
                            + " if all units your units leave the area."}
                    </Tooltip>
                }>
                    <Form.Check
                        id="chk-leave-pt"
                        label="Leave a Power Token"
                        checked={this.leavePowerToken}
                        onChange={() => this.leavePowerToken = !this.leavePowerToken}
                        disabled={!success}
                    />
                </OverlayTrigger>
            </Col>
        );
    }

    onUnitClick(region: Region, unit: Unit): void {
        this.selectedUnits.push(unit);
    }

    isUnitAvailable(unit: Unit): boolean {
        if (this.selectedUnits.indexOf(unit) != -1) {
            return false;
        }

        if (this.plannedMoves.values.some(units => units.indexOf(unit) != -1)) {
            return false;
        }

        return true;
    }

    onRegionClick(region: Region): void {
        const alreadyGoingUnits = this.plannedMoves.has(region) ? this.plannedMoves.get(region) as Unit[] : [];

        const newGoingArmy = alreadyGoingUnits.concat(this.selectedUnits);

        this.plannedMoves.set(region, newGoingArmy);

        this.selectedUnits = [];
    }

    onOrderClick(region: Region): void {
        this.selectedMarchOrderRegion = region;
    }

    reset(): void {
        this.selectedMarchOrderRegion = null;
        this.selectedUnits = [];
        this.plannedMoves = new BetterMap<Region, Unit[]>();
        this.leavePowerToken = false;
    }

    confirm(): void {
        if (!this.selectedMarchOrderRegion) {
            return;
        }

        if(this.plannedMoves.size == 0) {
            if(!confirm("Do you want to remove your March Order?")) {
                return;
            }
        }

        this.props.gameState.sendMoves(
            this.selectedMarchOrderRegion,
            this.plannedMoves,
            this.leavePowerToken
        );

        this.reset();
    }

    modifyOrdersOnMap(): [Region, PartialRecursive<OrderOnMapProperties>][] {
        if (this.props.gameClient.doesControlHouse(this.props.gameState.house)) {
            if (this.selectedMarchOrderRegion == null) {
                return this.props.gameState.getRegionsWithMarchOrder().map(r => [
                    r,
                    {highlight: {active: true}, onClick: () => this.onOrderClick(r)}
                ]);
            }
        }

        return [];
    }

    modifyUnitsOnMap(): [Unit, PartialRecursive<UnitOnMapProperties>][] {
        if (this.props.gameClient.doesControlHouse(this.props.gameState.house)) {
            if (this.selectedMarchOrderRegion != null) {
                return this.props.gameState.getValidMarchUnits(this.selectedMarchOrderRegion).filter(u => this.isUnitAvailable(u)).map(u => [
                    u,
                    {highlight: {active: true}, onClick: () => this.onUnitClick(this.selectedMarchOrderRegion as Region, u)}
                ]);
            }
        }

        return [];
    }

    modifyRegionsOnMap(): [Region, PartialRecursive<RegionOnMapProperties>][] {
        if (this.selectedMarchOrderRegion != null && this.selectedUnits.length > 0) {
            return this.props.gameState.getValidTargetRegions(this.selectedMarchOrderRegion, this.plannedMoves.entries, this.selectedUnits).map(r => [
                r,
                {highlight: {active: true}, onClick: () => this.onRegionClick(r)}
            ]);
        }

        return [];
    }

    componentDidMount(): void {
        this.props.mapControls.modifyOrdersOnMap.push(this.modifyOrdersOnMapCallback = () => this.modifyOrdersOnMap());
        this.props.mapControls.modifyUnitsOnMap.push(this.modifyUnitsOnMapCallback = () => this.modifyUnitsOnMap());
        this.props.mapControls.modifyRegionsOnMap.push(this.modifyRegionsOnMapCallback = () => this.modifyRegionsOnMap());

    }

    componentWillUnmount(): void {
        _.pull(this.props.mapControls.modifyOrdersOnMap, this.modifyOrdersOnMapCallback);
        _.pull(this.props.mapControls.modifyUnitsOnMap, this.modifyUnitsOnMapCallback);
        _.pull(this.props.mapControls.modifyRegionsOnMap, this.modifyRegionsOnMapCallback);

    }
}
