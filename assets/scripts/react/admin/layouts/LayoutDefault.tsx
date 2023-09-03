type Props = {
	title: string;
	children: React.ReactNode;
};

export default function LayoutDefault( { title, children }: Props ) {
	return (
		<div className="wpappointments-layout">
			<div className="wpappointments-layout__header">
				<h1>{ title }</h1>
			</div>
			<div className="wpappointments-layout__content">{ children }</div>
		</div>
	);
}
