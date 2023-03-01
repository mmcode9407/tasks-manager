import React, { Component } from 'react';

export default class TasksManager extends Component {
	state = {
		tasks: [
			{
				name: 'zadanie 1',
				time: 0,
				isRunning: false,
				isDone: false,
				isRemoved: false,
				id: 1,
			},
		],
		task: '',
	};

	inputChange = (e) => {
		const { name, value } = e.target;

		this.setState({
			[name]: value,
		});
	};

	render() {
		const { tasks, task } = this.state;

		return (
			<section>
				<form>
					<input
						type='text'
						name='task'
						value={task}
						onChange={this.inputChange}
					/>
					<input type='submit' value='Dodaj zadanie' />
				</form>
				<section>
					{tasks.map(({ name, time, id }) => {
						return (
							<div key={id}>
								<header>
									{name}, {time}
								</header>
								<footer>
									<button>start/stop</button>
									<button>zakończone</button>
									<button disabled={true}>usuń</button>
								</footer>
							</div>
						);
					})}
				</section>
			</section>
		);
	}
}
