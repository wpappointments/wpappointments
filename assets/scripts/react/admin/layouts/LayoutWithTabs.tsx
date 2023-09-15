type Props = {
	title: string;
	children: React.ReactNode;
};

export default function LayoutWithTabs( { title, children }: Props ) {
	return (
		<div className="wpappointments-layout wpappointments-layout--with-tabs">
			<div className="wpappointments-layout__header">
				<h1>{ title }</h1>
			</div>
			<div className="wpappointments-layout__content">{ children }</div>
		</div>
	);
}
