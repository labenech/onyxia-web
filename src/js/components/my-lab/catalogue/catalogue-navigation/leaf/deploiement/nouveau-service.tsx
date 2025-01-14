import { useState, useEffect, useCallback } from "react";
import { Tabs, Tab } from "@mui/material";
import Typography from "@mui/material/Typography";
import { AppBar, Chip, Button } from "@mui/material/";
// @ts-ignore
import queryString from "query-params";
import Formulaire from "./formulaire";
import { CustomService } from "./custom-service/component";
import { getAvatar } from "js/utils";
import { getMinioToken } from "js/minio-client/minio-client";
import FilDAriane, { fil } from "js/components/commons/fil-d-ariane";
import { getDefaultSingleOption } from "js/universe/universeContractFiller";
import "./nouveau-service.scss";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Loader from "js/components/commons/loader";
import JSONEditor from "js/components/commons/json-editor";
import { mustacheRender, filterOnglets } from "js/utils";
import { restApiPaths } from "js/restApiPaths";
import { id } from "tsafe/id";
import { assert } from "tsafe/assert";
import { is } from "tsafe/is";
import type { ReturnType } from "tsafe/ReturnType";
import { unwrapResult } from "@reduxjs/toolkit";
import { actions } from "js/redux/legacyActions";
//import { useDispatch, useIsBetaModeEnabled, useAppConstants } from "app/libApi";
//import { useMustacheParams } from "js/hooks";
import type { BuildMustacheViewParams } from "js/utils/form-field";
import { prOidcClient } from "lib/setup";
import { prAxiosInstance } from "lib/secondaryAdapters/officialOnyxiaApiClient";
import { routes } from "app/routes/router";

type Service = {
    category: "group" | "service";
    catalogId: string;
    name: string;
    currentVersion: number;
    postInstallNotes?: string;
    config: { properties: Record<string, Onglet> };
};

type MinioCredentials = ReturnType<typeof getMinioToken>;

export type Props = {
    idCatalogue: string;
    idService: string;
};

export const NouveauService: React.FC<Props> = ({ idCatalogue, idService }) => {
    const [redirect, setRedirect] = useState(false);
    const [service, setService] = useState<Service | undefined>(undefined);
    const [onglet, setOnglet] = useState(0);
    const [fieldsValues, setFieldsValues] = useState<
        Record<string, string | boolean | number>
    >({});
    const [initialValues, setInitialValues] = useState<Record<string, string>>({});
    const [ongletFields, setOngletFields] = useState<
        {
            description: string;
            nom: string;
            fields: {
                field: Record<
                    string,
                    Pick<
                        {
                            value: string;
                            hidden: boolean;
                            type: string;
                        },
                        "hidden"
                    >
                >;
            }[];
        }[]
    >([]);
    //@ts-ignore
    const { isUserLoggedIn } = useAppConstants();
    //@ts-ignore
    const dispatch = useDispatch();

    const [minioCredentials, setMinioCredentials] = useState<
        MinioCredentials | undefined
    >(undefined);
    const [contract, setContract] = useState<object | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    //@ts-ignore
    const { isBetaModeEnabled } = useIsBetaModeEnabled();
    //@ts-ignore
    const appConstants = useAppConstants();

    const queryParams = queryString.decode(getCleanParams());

    const handleClickCreer = useCallback(
        (preview = false) => {
            assert(is<Extract<typeof service, { name: string }>>(service));

            dispatch(
                actions.creerNouveauService({
                    "service": {
                        ...service,
                        catalogId: idCatalogue,
                    },
                    "options": getValuesObject(fieldsValues) as any,
                    "dryRun": preview,
                }),
            )
                .then(unwrapResult)
                //@ts-ignore
                .then(response => {
                    if (preview && !contract) {
                        setContract(response);
                    } else if (preview && contract) {
                        setContract(undefined);
                    } else {
                        setRedirect(true);
                    }
                });
        },
        [service, idCatalogue, fieldsValues, contract, dispatch],
    );

    useEffect(() => {
        if (isUserLoggedIn) {
            return;
        }

        prOidcClient.then(oidcClient => {
            assert(!oidcClient.isUserLoggedIn);
            oidcClient.login();
        });
    }, [isUserLoggedIn]);

    useEffect(() => {
        if (isUserLoggedIn) {
            getService(idCatalogue, idService).then(res => {
                setService(res as any);
                setLoading(false);
            });
        }
    }, [idCatalogue, idService, isUserLoggedIn]);

    useEffect(() => {
        if (isUserLoggedIn && !minioCredentials) {
            getMinioToken().then(setMinioCredentials);
        }
    }, [minioCredentials, isUserLoggedIn]);

    useEffect(() => {
        if (queryParams.auto) {
            handleClickCreer(false);
        }
    }, [queryParams.auto, handleClickCreer]);

    //@ts-ignore
    const { mustacheParams } = useMustacheParams();

    useEffect(() => {
        if (!service || ongletFields.length !== 0 || mustacheParams.s3 === undefined) {
            return;
        }

        const { iFV, fV, oF } = getOptions(
            //NOTE: we should be able to just write mustacheParams but
            //TS is not clever enough to figure it out.
            { ...mustacheParams, "s3": mustacheParams.s3 },
            service,
            queryParams,
        );
        setInitialValues(iFV);
        setFieldsValues(fV);
        setOngletFields(oF as any);
    }, [mustacheParams, service, ongletFields, queryParams]);

    const handlechangeField = (path: string) => (value: any) => {
        setFieldsValues({
            ...fieldsValues,
            [path]: (() => {
                switch (typeof fieldsValues[path]) {
                    case "boolean":
                        return value;
                    case "number":
                        return Number.parseFloat(value);
                    default:
                        return value;
                }
            })(),
        });
        setContract(undefined);
    };
    if (redirect) {
        routes.myServices().replace();
        return null;
    }

    const ongletContent = filterOnglets(ongletFields)[onglet] || {};
    return (
        <>
            <div className="en-tete en-tete-service">
                <Typography variant="h2" align="center" color="textPrimary" gutterBottom>
                    Créez votre propre service
                </Typography>
                {loading || ongletFields.length === 0 ? (
                    <Loader />
                ) : (
                    <div className="service">
                        <div className="titre">
                            <Chip
                                avatar={getAvatar(service)}
                                label={
                                    service && "name" in service
                                        ? service.name
                                        : undefined
                                }
                            />
                        </div>
                    </div>
                )}
            </div>
            <FilDAriane fil={fil.nouveauService(idCatalogue, idService)} />
            <div className="contenu nouveau-service">
                {loading || ongletFields.length === 0 ? (
                    <Loader em={18} />
                ) : (
                    <>
                        <AppBar position="static">
                            <Tabs
                                value={onglet}
                                onChange={(...[, o]) => setOnglet(o)}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                {mapServiceToOnglets(ongletFields as any)}
                            </Tabs>
                        </AppBar>
                        <div className="description">
                            <Typography
                                variant="button"
                                align="center"
                                color="textPrimary"
                                gutterBottom
                            >
                                {ongletContent.description}
                            </Typography>
                        </div>
                        <Formulaire
                            user={{
                                "idep": appConstants.isUserLoggedIn
                                    ? appConstants.parsedJwt.username
                                    : "",
                            }}
                            name={ongletContent.nom}
                            handleChange={handlechangeField}
                            fields={ongletContent.fields}
                            values={fieldsValues}
                        />

                        <div className="actions">
                            <Button
                                id="bouton-creer-nouveau-service"
                                variant="contained"
                                color="primary"
                                onClick={() => handleClickCreer(false)}
                            >
                                Créer votre service
                            </Button>
                            {isBetaModeEnabled ? (
                                <IconButton
                                    id="bouton-preview-nouveau-service"
                                    //variant="contained"
                                    color="primary"
                                    onClick={() => handleClickCreer(true)}
                                >
                                    <VisibilityIcon>Preview</VisibilityIcon>
                                </IconButton>
                            ) : (
                                <></>
                            )}
                            {contract ? (
                                <JSONEditor json={contract} readOnly={true} />
                            ) : (
                                <></>
                            )}
                        </div>
                        <div>
                            <CustomService
                                initialValues={initialValues}
                                fieldsValues={fieldsValues}
                                setInit={() => setFieldsValues(initialValues)}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

type Onglet = {
    description?: string;
    properties: Record<
        string,
        {
            type: "boolean" | "number" | "string" | "object";
            properties: {
                path: string;
                field: Omit<Onglet["properties"][string], "type"> & {
                    nom: string;
                    type: Onglet["properties"][string]["type"] | "select";
                    options: string[];
                };
            }[];
            enum: string[];
            title: string;
        }
    >;
};

const getOnglets = (onglets: Record<string, Onglet>) =>
    Object.entries(onglets)
        .map(([nom, onglet]) => mapOngletToFields(nom)(onglet))
        .filter(o => o.fields && o.fields.length > 0);

const escapeDots = (str: string) => str.replace(/\./g, "\\.");

const mapOngletToFields = (nom: string) => (onglet: Onglet) => ({
    nom: nom,
    description: onglet.description || "Cet onglet ne possède pas de description.",
    fields: getFields(escapeDots(nom))(onglet.properties),
});

const getFields = (nom: string) => (ongletProperties: Onglet["properties"]) => {
    if (!ongletProperties) {
        return;
    }
    const fields: Onglet["properties"][string]["properties"] = [];

    Object.entries(ongletProperties).forEach(([key, entry]) => {
        const { type, properties, enum: options, title } = entry;
        const path = `${nom}.${escapeDots(key)}`;

        switch (type) {
            case "boolean":
            case "number":
            case "string":
                fields.push({
                    path,
                    field: {
                        ...entry,
                        type: options && options.length > 0 ? "select" : type,
                        nom: title || key,
                        options: options,
                    },
                });
                break;
            case "object":
                const fieldsToAdd = getFields(path)(properties as any);

                assert(fieldsToAdd !== undefined);

                fields.push(...fieldsToAdd);

                break;
            default:
                break;
        }
    });

    return fields;
};

const arrayToObject =
    (queryParams: Record<string, string>) =>
    (buildMustacheViewParams: BuildMustacheViewParams) =>
    (
        fields: {
            path: string;
            field: { "js-control": string; type: string };
        }[],
    ) => {
        const obj: Record<string, any> = {};
        const fromParams = getFromQueryParams(queryParams);
        fields.forEach(
            ({ path, field }) =>
                (obj[path] =
                    fromParams(path)(field) ??
                    (mustacheRender(field as any, buildMustacheViewParams) ||
                        getDefaultSingleOption(field))),
        );
        return obj;
    };

const getCleanParams = () =>
    window.location.search.startsWith("?")
        ? window.location.search.substring(1, window.location.search.length)
        : window.location.search;

const getFromQueryParams =
    (queryParams: Record<string, string>) =>
    (path: string) =>
    ({ "js-control": jsControl, type }: { "js-control": string; type: string }) => {
        if (jsControl === "ro") {
            return undefined;
        }

        if (!(path in queryParams)) {
            return undefined;
        }

        const value = queryParams[path];

        switch (type) {
            case "boolean":
                return value === "true";
            case "number":
                return Number.parseFloat(value);
            default:
                return value;
        }
    };

const mapServiceToOnglets = (
    ongletFields: {
        nom: string;
        description: string;
        fields: { field: Record<string, { nom: string; hidden: boolean }> }[];
    }[],
) => filterOnglets(ongletFields).map(({ nom }, i) => <Tab key={i} label={nom} />);

/*
 * Fonctions permettant de remettre en forme les valeurs
 * de champs comme attendu par l'api.
 */
export const getValuesObject = (
    fieldsValues: Record<string, string | boolean | number>,
) =>
    Object.entries(fieldsValues)
        .map(([key, value]) => ({
            "path": key
                //NOTE the two next pipe mean "split all non escaped dots"
                //the regular expression 'look behind' is not supported by Safari.
                .split(".")
                .reduce<string[]>(
                    (prev, curr) =>
                        prev[prev.length - 1]?.endsWith("\\")
                            ? ((prev[prev.length - 1] += `.${curr}`), prev)
                            : [...prev, curr],
                    [],
                )
                .map(s => s.replace(/\\\./g, ".")),
            value,
        }))
        .reduce(
            (acc, curr) => ({ ...acc, ...getPathValue(curr)(acc) }),
            id<Record<string, string | boolean | number>>({}),
        );

const getPathValue =
    ({
        path: [first, ...rest],
        value,
    }: {
        path: string[];
        value: string | boolean | number;
    }) =>
    (
        other = id<Record<string, string | boolean | number>>({}),
    ): Record<string, string | boolean | number> => {
        if (rest.length === 0) {
            return { [first]: value, ...other };
        }
        return {
            ...other,
            [first]: getPathValue({ path: rest, value })(other[first] as any) as any,
        };
    };

export const getOptions = (
    buildMustacheParams: BuildMustacheViewParams,
    service: Service,
    queryParams: Record<string, string>,
) => {
    const onglets = (service && service.config && service.config.properties) || {};
    const oF = getOnglets(onglets);
    const fields = oF.map(onglet => onglet.fields);
    const fV = fields.reduce(
        (acc, curr) => ({
            ...acc,
            ...arrayToObject(queryParams)(buildMustacheParams)(curr as any),
        }),
        {},
    );
    const iFV = fields.reduce(
        (acc, curr) => ({
            ...acc,
            ...arrayToObject({})(buildMustacheParams)(curr as any),
        }),
        {},
    );
    return { fV, iFV, oF };
};

export const getService = async (idCatalogue: string, idService: string) =>
    (await prAxiosInstance)(`${restApiPaths.catalogue}/${idCatalogue}/${idService}`).then(
        ({ data }) => data,
    );
