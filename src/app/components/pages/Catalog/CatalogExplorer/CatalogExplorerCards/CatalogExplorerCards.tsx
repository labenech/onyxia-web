import { useEffect, useState, useMemo, memo } from "react";
import { makeStyles } from "app/theme";

import { useCallbackFactory } from "powerhooks/useCallbackFactory";
import { CatalogExplorerCard } from "./CatalogExplorerCard";
import { useTranslation } from "app/i18n/useTranslations";
import { Button, Text } from "app/theme";
import { useConstCallback } from "powerhooks/useConstCallback";
import Link from "@material-ui/core/Link";
import { ReactComponent as ServiceNotFoundSvg } from "app/assets/svg/ServiceNotFound.svg";
import { CatalogExplorerSearchBar } from "../CatalogExplorerSearchBar";
import type { Props as SearchBarProps } from "../CatalogExplorerSearchBar";
import { Evt } from "evt";
import type { UnpackEvt } from "evt";
import { breakpointsValues } from "onyxia-ui";

export type Props<PackageName extends string = string> = {
    className?: string;
    search: string;
    setSearch(search: string): void;
    packages: {
        packageName: PackageName;
        packageIconUrl?: string;
        packageDescription: string;
        packageHomeUrl?: string;
    }[];
    onRequestLaunch(packageName: PackageName): void;
};

const useStyles = makeStyles<{
    filteredCardCount: number;
}>()((theme, { filteredCardCount }) => ({
    "root": {
        //Or set by the parent,
        //it must be constrained or the scroll will not work
        //"height": "100%",
        "display": "flex",
        "flexDirection": "column",
    },
    "contextTypo": {
        "margin": theme.spacing(4, 0),
    },
    "cardsWrapper": {
        "flex": 1,
        "overflow": "auto",
    },
    "cards": {
        ...(filteredCardCount === 0
            ? {}
            : {
                  "display": "grid",
                  "gridTemplateColumns": `repeat(${(() => {
                      if (
                          theme.responsive.windowInnerWidth >=
                          breakpointsValues.xl
                      ) {
                          return 4;
                      }
                      if (
                          theme.responsive.windowInnerWidth >=
                          breakpointsValues.lg
                      ) {
                          return 3;
                      }

                      return 2;
                  })()},1fr)`,
                  "gap": theme.spacing(4),
              }),
    },
}));

export const CatalogExplorerCards = memo(
    <PackageName extends string = string>(props: Props<PackageName>) => {
        const {
            className,
            packages: cardsContent,
            onRequestLaunch,
            search,
            setSearch,
        } = props;

        const onRequestLaunchFactory = useCallbackFactory(
            ([packageName]: [PackageName]) => onRequestLaunch(packageName),
        );

        const [isRevealed, setIsRevealed] = useState(false);

        const onShowMoreClick = useConstCallback(() => setIsRevealed(true));

        const { t } = useTranslation("CatalogExplorerCards");

        useEffect(() => {
            //NOTE: We use setTimeout only because of Safari
            const timer = setTimeout(() => setIsRevealed(search !== ""), 0);

            return () => clearTimeout(timer);
        }, [search]);

        const filteredCards = useMemo(
            () =>
                cardsContent
                    .slice(0, isRevealed ? cardsContent.length : 5)
                    .filter(({ packageName, packageDescription }) =>
                        [packageName, packageDescription]
                            .map(str =>
                                str
                                    .toLowerCase()
                                    .includes(search.toLowerCase()),
                            )
                            .includes(true),
                    ),
            [cardsContent, isRevealed, search],
        );

        const { classes, cx } = useStyles({
            "filteredCardCount": filteredCards.length,
        });

        const [evtSearchBarAction] = useState(() =>
            Evt.create<UnpackEvt<SearchBarProps["evtAction"]>>(),
        );

        const onGoBackClick = useConstCallback(() =>
            evtSearchBarAction.post("CLEAR SEARCH"),
        );

        return (
            <div className={cx(classes.root, className)}>
                <CatalogExplorerSearchBar
                    search={search}
                    evtAction={evtSearchBarAction}
                    onSearchChange={setSearch}
                />
                {filteredCards.length === 0 ? undefined : (
                    <Text
                        typo="section heading"
                        className={classes.contextTypo}
                    >
                        {t(
                            search !== ""
                                ? "search results"
                                : isRevealed
                                ? "all services"
                                : "main services",
                        )}
                    </Text>
                )}
                <div className={classes.cardsWrapper}>
                    <div className={classes.cards}>
                        {filteredCards.length === 0 ? (
                            <NoMatches
                                search={search}
                                onGoBackClick={onGoBackClick}
                            />
                        ) : (
                            filteredCards.map(
                                ({
                                    packageName,
                                    packageIconUrl,
                                    packageDescription,
                                    packageHomeUrl,
                                }) => (
                                    <CatalogExplorerCard
                                        key={packageName}
                                        packageIconUrl={packageIconUrl}
                                        packageName={packageName}
                                        packageDescription={packageDescription}
                                        onRequestLaunch={onRequestLaunchFactory(
                                            packageName,
                                        )}
                                        packageHomeUrl={packageHomeUrl}
                                    />
                                ),
                            )
                        )}
                        {!isRevealed && (
                            <CardShowMore
                                leftToShowCount={cardsContent.length - 5}
                                onClick={onShowMoreClick}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    },
);

export declare namespace CatalogExplorerCards {
    export type I18nScheme = {
        "main services": undefined;
        "all services": undefined;
        "search results": undefined;
        "show more": undefined;
        "no service found": undefined;
        "no result found": { forWhat: string };
        "check spelling": undefined;
        "go back": undefined;
    };
}

const { CardShowMore } = (() => {
    type Props = {
        onClick(): void;
        leftToShowCount: number;
    };

    const useStyles = makeStyles()(() => ({
        "root": {
            "display": "flex",
            "justifyContent": "center",
            "alignItems": "center",
        },
    }));

    const CardShowMore = memo((props: Props) => {
        const { leftToShowCount, onClick } = props;

        const { t } = useTranslation("CatalogExplorerCards");

        const { classes } = useStyles();

        return (
            <div className={classes.root}>
                <Button onClick={onClick}>
                    {t("show more")}&nbsp;({leftToShowCount})
                </Button>
            </div>
        );
    });

    return { CardShowMore };
})();

const { NoMatches } = (() => {
    type Props = {
        search: string;
        onGoBackClick(): void;
    };

    const useStyles = makeStyles()(theme => ({
        "root": {
            "display": "flex",
            "justifyContent": "center",
        },
        "innerDiv": {
            "textAlign": "center",
            "maxWidth": 500,
        },
        "svg": {
            "fill": theme.colors.palette.dark.greyVariant2,
            "width": 100,
            "margin": 0,
        },
        "h2": {
            "margin": theme.spacing(4, 0),
        },
        "typo": {
            "marginBottom": theme.spacing(1),
            "color": theme.colors.palette.light.greyVariant3,
        },
        "link": {
            "cursor": "pointer",
        },
    }));

    const NoMatches = memo((props: Props) => {
        const { search, onGoBackClick } = props;

        const { classes } = useStyles();

        const { t } = useTranslation("CatalogExplorerCards");

        return (
            <div className={classes.root}>
                <div className={classes.innerDiv}>
                    <ServiceNotFoundSvg className={classes.svg} />
                    <Text typo="page heading" className={classes.h2}>
                        {t("no service found")}
                    </Text>
                    <Text className={classes.typo} typo="body 1">
                        {t("no result found", { "forWhat": search })}
                    </Text>
                    <Text className={classes.typo} typo="body 1">
                        {t("check spelling")}
                    </Text>
                    <Link className={classes.link} onClick={onGoBackClick}>
                        {t("go back")}
                    </Link>
                </div>
            </div>
        );
    });

    return { NoMatches };
})();