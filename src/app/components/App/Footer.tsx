import { memo } from "react";
import { makeStyles, Text } from "app/theme";
import { useTranslation } from "app/i18n/useTranslations";
import { ReactComponent as GitHubSvg } from "app/assets/svg/GitHub.svg";

export type Props = {
    className?: string;
    packageJsonVersion: string;
    contributeUrl: string;
    tosUrl: string;
};

const useStyles = makeStyles<Props>()(theme => ({
    "root": {
        "backgroundColor": theme.colors.useCases.surfaces.background,
        "display": "flex",
        "alignItems": "center",
        "padding": theme.spacing(0, 4),
        "& a:hover": {
            "textDecoration": "underline",
            "textDecorationColor": theme.colors.useCases.typography.textPrimary,
        },
    },
    "icon": {
        "fill": theme.colors.useCases.typography.textPrimary,
    },
    "contribute": {
        "display": "flex",
        "alignItems": "center",
    },
    "sep": {
        "flex": 1,
    },
    "spacing": {
        "width": theme.spacing(4),
    },
}));

export const Footer = memo((props: Props) => {
    const { contributeUrl, tosUrl, packageJsonVersion, className } = props;

    const { classes, cx } = useStyles(props);

    const { t } = useTranslation("Footer");

    const spacing = <div className={classes.spacing} />;

    return (
        <footer className={cx(classes.root, className)}>
            <Text typo="body 2">2017 - 2021 Onyxia, InseefrLab</Text>
            {spacing}
            <a
                href={contributeUrl}
                className={classes.contribute}
                target="_blank"
                rel="noreferrer"
            >
                <GitHubSvg className={classes.icon} />
                &nbsp;
                <Text typo="body 2">{t("contribute")}</Text>
            </a>
            <div className={classes.sep} />
            <a href={tosUrl} target="_blank" rel="noreferrer">
                {" "}
                <Text typo="body 2">{t("terms of service")}</Text>{" "}
            </a>
            {spacing}
            <a
                href={`https://github.com/InseeFrLab/onyxia-web/tree/v${packageJsonVersion}`}
                target="_blank"
                rel="noreferrer"
            >
                <Text typo="body 2">v{packageJsonVersion} </Text>
            </a>
        </footer>
    );
});

export declare namespace Footer {
    export type I18nScheme = {
        "contribute": undefined;
        "terms of service": undefined;
    };
}