import React from 'react';
import ReactDom from 'react-dom';
import Tooltip from '@mui/material/Tooltip';
import { Fab, Icon } from '@mui/material';
import { ArrowIcon } from 'js/components/commons/icons';
import D from 'js/i18n';
import { routes } from "app/routes/router";

export const LinkTo = ({
	disabled = false,
	onClick,
	type = 'forward',
	anchorProps= routes.home().link,
	component: Component = undefined,
	title = '',
}) => (
	<a {...anchorProps}>
		<Tooltip title={title}>
			<Fab
				className="fab"
				disabled={disabled}
				color="primary"
				onClick={onClick}
			>
				<Icon>{Component ? <Component /> : type}</Icon>
			</Fab>
		</Tooltip>
	</a>
);

export const Next = ({ next, disabled = false, type = 'arrow_right' }) => (
	<Tooltip title={D.btnNext}>
		<Fab
			className="bouton"
			disabled={disabled}
			aria-label={D.btnNext}
			color="primary"
			onClick={next}
		>
			<Icon>{type}</Icon>
		</Fab>
	</Tooltip>
);

export const Prec = ({ prec, disabled = false, type = 'arrow_left' }) => (
	<Tooltip title={D.btnPrevious}>
		<Fab
			className="bouton"
			disabled={disabled}
			aria-label={D.btnPrevious}
			color="secondary"
			onClick={prec}
		>
			<Icon>{type}</Icon>
		</Fab>
	</Tooltip>
);

export const Both = ({ next, prec }) => (
	<>
		<Prec prec={prec} />
		<Next next={next} />
	</>
);

export const Bye = () => (
	<Fab
		className="bouton"
		aria-label="bye!"
		color="secondary"
		onClick={() => (window.location = `${window.location.origin}`)}
	>
		<Icon>clear</Icon>
	</Fab>
);

export const Arrow = ({ dom }) =>
	dom
		? ReactDom.createPortal(
				<span
					className="arrow-left"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						return false;
					}}
				>
					<ArrowIcon width={60} height={40} />
				</span>,
				dom
		  )
		: null;

export const CarteMask = ({ dom }) =>
	dom ? ReactDom.createPortal(<span className="mask" />, dom) : null;
