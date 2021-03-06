import {observer} from "mobx-react";
import {Component, ReactNode} from "react";
import CombatGameState
    from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/combat-game-state/CombatGameState";
import DeclareSupportGameState
    from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/combat-game-state/declare-support-game-state/DeclareSupportGameState";
import DeclareSupportComponent from "./DeclareSupportComponent";
import * as React from "react";
import ChooseHouseCardGameState
    from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/combat-game-state/choose-house-card-game-state/ChooseHouseCardGameState";
import ChooseHouseCardComponent from "./ChooseHouseCardComponent";
import UseValyrianSteelBladeGameState
    from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/combat-game-state/use-valyrian-steel-blade-game-state/UseValyrianSteelBladeGameState";
import UseValyrianSteelBladeComponent from "./UseValyrianSteelBladeComponent";
import House from "../../common/ingame-game-state/game-data-structure/House";
import GameStateComponentProps from "./GameStateComponentProps";
import renderChildGameState from "../utils/renderChildGameState";
import PostCombatGameState
    from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/combat-game-state/post-combat-game-state/PostCombatGameState";
import PostCombatComponent from "./PostCombatComponent";
import ImmediatelyHouseCardAbilitiesResolutionGameState
    from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/combat-game-state/immediately-house-card-abilities-resolution-game-state/ImmediatelyHouseCardAbilitiesResolutionGameState";
import ImmediatelyHouseCardAbilitiesResolutionComponent
    from "./house-card-abilities/ImmediatelyHouseCardAbilitiesResolutionComponent";
import CancelHouseCardAbilitiesGameState
    from "../../common/ingame-game-state/action-game-state/resolve-march-order-game-state/combat-game-state/cancel-house-card-abilities-game-state/CancelHouseCardAbilitiesGameState";
import CancelHouseCardAbilitiesComponent from "./house-card-abilities/CancelHouseCardAbilitiesComponent";
import Col from "react-bootstrap/Col";
import CombatInfoComponent from "../CombatInfoComponent";
import Region from "../../common/ingame-game-state/game-data-structure/Region";
import { RegionOnMapProperties } from "../MapControls";
import PartialRecursive from "../../utils/PartialRecursive";
import _ from "lodash";

@observer
export default class CombatComponent extends Component<GameStateComponentProps<CombatGameState>> {
    modifyRegionsOnMapCallback: any;

    get combatGameState(): CombatGameState {
        return this.props.gameState;
    }

    get attacker(): House {
        return this.combatGameState.attacker;
    }

    get defender(): House {
        return this.combatGameState.defender;
    }

    render(): ReactNode {
        return (
            <>
                <Col xs={12}>
                    {!(this.props.gameState.childGameState instanceof PostCombatGameState) && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <h5>Battle for <strong>{this.combatGameState.defendingRegion.name}</strong></h5>
                            </div>
                            <CombatInfoComponent
                                housesCombatData={[
                                    {
                                        house: this.attacker,
                                        houseCard: this.props.gameState.attackerHouseCard,
                                        region: this.props.gameState.attackingRegion,
                                        army: this.combatGameState.getBaseCombatStrength(this.attacker),
                                        armyUnits: this.combatGameState.attackingArmy.map(u => u.type),
                                        orderBonus: this.combatGameState.getOrderBonus(this.attacker),
                                        garrison: this.combatGameState.getGarrisonCombatStrength(this.attacker),
                                        support: this.combatGameState.getSupportStrengthForSide(this.attacker),
                                        houseCardStrength: this.combatGameState.getHouseCardCombatStrength(this.attacker),
                                        valyrianSteelBlade: this.combatGameState.getValyrianBladeBonus(this.attacker),
                                        total: this.combatGameState.getTotalCombatStrength(this.attacker),
                                    },
                                    {
                                        house: this.defender,
                                        houseCard: this.props.gameState.defenderHouseCard,
                                        region: this.props.gameState.defendingRegion,
                                        army: this.combatGameState.getBaseCombatStrength(this.defender),
                                        armyUnits: this.combatGameState.defendingArmy.map(u => u.type),
                                        orderBonus: this.combatGameState.getOrderBonus(this.defender),
                                        garrison: this.combatGameState.getGarrisonCombatStrength(this.defender),
                                        support: this.combatGameState.getSupportStrengthForSide(this.defender),
                                        houseCardStrength: this.combatGameState.getHouseCardCombatStrength(this.defender),
                                        valyrianSteelBlade: this.combatGameState.getValyrianBladeBonus(this.defender),
                                        total: this.combatGameState.getTotalCombatStrength(this.defender),
                                    }
                                ]}
                            />
                        </>
                    )}
                </Col>
                {renderChildGameState(this.props, [
                    [DeclareSupportGameState, DeclareSupportComponent],
                    [ChooseHouseCardGameState, ChooseHouseCardComponent],
                    [UseValyrianSteelBladeGameState, UseValyrianSteelBladeComponent],
                    [PostCombatGameState, PostCombatComponent],
                    [ImmediatelyHouseCardAbilitiesResolutionGameState, ImmediatelyHouseCardAbilitiesResolutionComponent],
                    [CancelHouseCardAbilitiesGameState, CancelHouseCardAbilitiesComponent]
                ])}
            </>
        );
    }

    modifyRegionsOnMap(): [Region, PartialRecursive<RegionOnMapProperties>][] {
        // Highlight the embattled are in yellow
        return [[
            this.props.gameState.defendingRegion,
            {highlight: {active: true, color: "yellow"}}
        ]];
    }

    componentDidMount(): void {
        this.props.mapControls.modifyRegionsOnMap.push(this.modifyRegionsOnMapCallback = () => this.modifyRegionsOnMap());
    }

    componentWillUnmount(): void {
        _.pull(this.props.mapControls.modifyRegionsOnMap, this.modifyRegionsOnMapCallback);
    }
}
