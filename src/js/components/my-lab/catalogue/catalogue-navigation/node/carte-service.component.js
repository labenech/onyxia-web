import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Fab from '@mui/material/Fab';
import Icon from '@mui/material/Icon';
import { getAvatar } from 'js/utils';
import { WorkInProgress } from 'js/components/commons/icons';
import { routes } from "app/routes/router";

const Carte = ({ idCatalogue, service, setServiceSelected }) => {
	const down = service.disable;
	return (
		<Grid item lg={4} md={6} xs={12} classes={{ item: 'carte' }}>
			<Card
				classes={{ root: 'container' }}
				className={`${down ? 'down-app' : null}`}
			>
				<CardHeader
					avatar={getAvatar(service)}
					title={service.name}
					subheader={service.status}
					classes={{
						root: 'en-tete',
						avatar: 'avatar',
						title: 'titre',
						subheader: 'sous-titre',
					}}
				/>
				{down ? <DownApp /> : null}
				<CardContent>
					<div className="paragraphe">
						<div className="titre">Description</div>
						<div className="corps">{service.description}</div>
					</div>
				</CardContent>
				<CardActions className="boutons">
					{down ? null : (
						<>
							<a {...routes.catalog({
								"optionalTrailingPath": `${idCatalogue}/${service.name}`
							}).link}>
								<Fab
									id={`bouton-service-${service.name}`}
									color="primary"
									aria-label="Nouveau"
									onClick={() => setServiceSelected({ service })}
								>
									<Icon>more_horiz</Icon>
								</Fab>
							</a>
							<a {...routes.catalog({
								"optionalTrailingPath": `${idCatalogue}/${service.name}/deploiement`
							}).link}>
								<Fab
									className="bouton"
									id={`bouton-service-${service.name}`}
									color="primary"
									aria-label="Nouveau"
									onClick={() => setServiceSelected({ service })}
								>
									<Icon>add</Icon>
								</Fab>
							</a>
						</>
					)}
				</CardActions>
			</Card>
		</Grid>
	);
};

Carte.propTypes = {
	idCatalogue: PropTypes.string.isRequired,
	service: PropTypes.shape({ disable: PropTypes.bool.isRequired }).isRequired,
	setServiceSelected: PropTypes.func.isRequired,
};

export default Carte;

const DownApp = () => (
	<span className="work-in-progress">
		<WorkInProgress />
	</span>
);
