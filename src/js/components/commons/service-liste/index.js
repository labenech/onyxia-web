import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import { MoreHoriz } from '@material-ui/icons';

export const ServicesListe = ({
	services,
	titre,
	openService,
	openDetails,
}) => (
	<Grid item sm={12} lg={4} classes={{ item: 'carte' }}>
		<Card classes={{ root: 'container' }}>
			<CardHeader
				title={titre}
				classes={{
					root: 'en-tete',
					title: 'titre',
				}}
			/>
			<CardContent>
				<Liste
					liste={services}
					openService={openService}
					openDetails={openDetails}
				/>
			</CardContent>
		</Card>
	</Grid>
);

export const Liste = ({ liste, openService, openDetails }) => {
	const items = liste.map((service, i) => {
		const title = service.labels
			? service.labels.ONYXIA_TITLE
			: service.apps.length === 0
			? 'Supprime moi'
			: service.apps[0].labels.ONYXIA_TITLE;
		const subtitle = service.labels
			? service.labels.ONYXIA_SUBTITLE
			: service.apps.length === 0
			? service.id
			: service.apps[0].labels.ONYXIA_TITLE;
		return (
			<React.Fragment key={i}>
				<ListItem
					button
					classes={{ root: 'liste-item' }}
					onClick={() => openService(service)}
				>
					<span
						className={`etat-service ${getColorClassStateService(service)}`}
					>
						<div className="inner-1">
							<div className="inner">
								<Avatar
									src={service.labels.ONYXIA_LOGO}
									className="service-avatar"
								/>
							</div>
						</div>
					</span>
					<ListItemText primary={title} secondary={subtitle} />
					<div
						className="button-more"
						title="plus d'options"
						onClick={(e) => {
							e.stopPropagation();
							openDetails(service);
						}}
					>
						<MoreHoriz />
					</div>
				</ListItem>

				<Divider inset />
			</React.Fragment>
		);
	});
	return <List>{items}</List>;
};

//
export const getColorClassStateService = ({
	tasksStaged,
	tasksRunning,
	tasksHealthy,
	tasksUnhealthy,
}) => {
	if (tasksStaged !== 0) {
		return 'warn';
	} else if (tasksRunning > 0 && tasksHealthy > 0) {
		return 'running';
	} else if (tasksRunning > 0 && tasksHealthy === 0) {
		return 'pause';
	}
	return 'down';
};

export { default as CarteService } from './carte-service.component';
export { getServiceAvatar, getTitle, getSubtitle } from './carte-service.utils';
export { default as CarteMonService } from './carte-mon-service';
export { default as CarteMonGroupe } from './carte-mon-groupe';