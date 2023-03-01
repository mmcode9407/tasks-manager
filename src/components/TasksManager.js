import React, { Component } from 'react';

export default class TasksManager extends Component {
	constructor(props) {
		super(props);
		this.API_LINK = 'http://localhost:3005/data';
	}

	state = {
		tasks: [],
		task: '',
	};

	inputChange = (e) => {
		const { name, value } = e.target;

		this.setState({
			[name]: value,
		});
	};

	submitHandler = (e) => {
		e.preventDefault();

		const data = this.createDataForAPI();

		this.addData(data)
			.then((data) => {
				this.setState((state) => {
					return {
						tasks: [...state.tasks, data],
					};
				});
			})
			.then(
				this.setState({
					task: '',
				})
			);
	};

	createDataForAPI() {
		const { task } = this.state;
		return {
			name: task,
			time: 0,
			isRunning: false,
			isDone: false,
			isRemoved: false,
		};
	}

	render() {
		const { tasks, task } = this.state;

		return (
			<section>
				<form onSubmit={this.submitHandler}>
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

	componentDidMount() {
		this.getData().then((data) => {
			this.setState({
				tasks: data,
			});
		});
	}

	getData() {
		return this.fetchData();
	}

	addData(data) {
		const options = {
			method: 'POST',
			body: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json' },
		};

		return this.fetchData(options);
	}

	fetchData(options, additionalPath = '') {
		const API_URL = `${this.API_LINK}${additionalPath}`;

		return fetch(API_URL, options).then((resp) => {
			if (resp.ok) {
				return resp.json();
			}
			throw new Error(resp.status);
		});
	}
}
