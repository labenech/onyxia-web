import { assert } from "tsafe/assert";
import type { ThunkAction } from "../setup";
import type { DeploymentRegion } from "../ports/OnyxiaApiClient";
import { createSlice } from "@reduxjs/toolkit";
import { thunks as userConfigsThunks } from "./userConfigs";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
    createObjectThatThrowsIfAccessedFactory,
    isPropertyAccessedByReduxOrStorybook,
} from "../tools/createObjectThatThrowsIfAccessed";
import type { RootState } from "../setup";

type DeploymentRegionState = {
    availableDeploymentRegions: DeploymentRegion[];
    selectedDeploymentRegionId: string;
};

export const name = "deploymentRegion";

const { createObjectThatThrowsIfAccessed } = createObjectThatThrowsIfAccessedFactory({
    "isPropertyWhitelisted": isPropertyAccessedByReduxOrStorybook,
});

const { reducer, actions } = createSlice({
    name,
    "initialState": createObjectThatThrowsIfAccessed<DeploymentRegionState>(),
    "reducers": {
        "initialize": (_, { payload }: PayloadAction<DeploymentRegionState>) => payload,
        "deploymentRegionChanged": (
            state,
            { payload }: PayloadAction<{ deploymentRegionId: string }>,
        ) => {
            const { deploymentRegionId } = payload;

            state.selectedDeploymentRegionId = deploymentRegionId;
        },
    },
});

export { reducer };

export const thunks = {
    "changeDeploymentRegion":
        (params: { deploymentRegionId: string }): ThunkAction =>
        async (...args) => {
            const [dispatch, , { oidcClient }] = args;

            const { deploymentRegionId } = params;

            if (oidcClient.isUserLoggedIn) {
                await dispatch(
                    userConfigsThunks.changeValue({
                        "key": "deploymentRegionId",
                        "value": deploymentRegionId,
                    }),
                );
            } else {
                localStorage.setItem(localStorageKey, deploymentRegionId);
            }

            dispatch(actions.deploymentRegionChanged({ deploymentRegionId }));
        },
};

export const privateThunks = {
    "initialize":
        (): ThunkAction =>
        async (...args) => {
            const [dispatch, getState, { onyxiaApiClient, oidcClient }] = args;

            const availableDeploymentRegions =
                await onyxiaApiClient.getAvailableRegions();

            const localStorageGetItem = () => {
                const value = localStorage.getItem(localStorageKey);

                if (
                    value !== null &&
                    !availableDeploymentRegions.map(({ id }) => id).includes(value)
                ) {
                    localStorage.removeItem(localStorageKey);

                    return null;
                }

                return value;
            };

            if (!oidcClient.isUserLoggedIn) {
                const selectedDeploymentRegionId = localStorageGetItem();

                if (selectedDeploymentRegionId === null) {
                    localStorage.setItem(
                        localStorageKey,
                        availableDeploymentRegions[0].id,
                    );
                }

                dispatch(
                    actions.initialize({
                        availableDeploymentRegions,
                        "selectedDeploymentRegionId": localStorageGetItem()!,
                    }),
                );
            } else {
                if (
                    localStorageGetItem() !== null ||
                    (() => {
                        const deploymentRegionId =
                            getState().userConfigs.deploymentRegionId.value;

                        if (deploymentRegionId === null) {
                            return true;
                        }

                        return !availableDeploymentRegions
                            .map(({ id }) => id)
                            .includes(deploymentRegionId);
                    })()
                ) {
                    await dispatch(
                        userConfigsThunks.changeValue({
                            "key": "deploymentRegionId",
                            "value":
                                localStorageGetItem() ?? availableDeploymentRegions[0].id,
                        }),
                    );

                    localStorage.removeItem(localStorageKey);
                }

                dispatch(
                    actions.initialize({
                        availableDeploymentRegions,
                        "selectedDeploymentRegionId":
                            getState().userConfigs.deploymentRegionId.value!,
                    }),
                );
            }
        },
};

export const selectors = (() => {
    const selectedDeploymentRegion = (rootState: RootState): DeploymentRegion => {
        const { selectedDeploymentRegionId, availableDeploymentRegions } =
            rootState.deploymentRegion;

        const selectedDeploymentRegion = availableDeploymentRegions.find(
            ({ id }) => id === selectedDeploymentRegionId,
        );

        assert(selectedDeploymentRegion !== undefined);

        return selectedDeploymentRegion;
    };

    return { selectedDeploymentRegion };
})();

const localStorageKey = "selectedDeploymentRegionId";