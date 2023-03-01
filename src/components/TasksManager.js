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

		if (data) {
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
		} else {
			alert('Nie można dodać pustego zadania!');
		}
	};

	createDataForAPI() {
		const { task } = this.state;

		if (task !== '') {
			return {
				name: task,
				time: 0,
				isRunning: false,
				isDone: false,
				isRemoved: false,
			};
		} else {
			return null;
		}
	}

	startTask = (taskId) => {
		if (!this.interval) {
			this.interval = setInterval(() => this.incrementTime(taskId), 1000);
		}
	};

	incrementTime(taskId) {
		const newState = (state) => {
			const newTasks = state.tasks.map((task) => {
				if (task.id === taskId) {
					return { ...task, isRunning: true, time: task.time + 1 };
				}
				return task;
			});

			return { tasks: newTasks };
		};

		this.setState(newState, () => this.updateTaskInAPI(taskId));
	}

	stopTask = (taskId) => {
		clearInterval(this.interval);
		this.interval = null;

		this.setTaskState(taskId, { isRunning: false });
	};

	setTaskState(taskId, taskState) {
		const newState = (state) => {
			const newTasks = state.tasks.map((task) => {
				if (task.id === taskId) {
					return { ...task, ...taskState };
				}
				return task;
			});

			return { tasks: newTasks };
		};

		this.setState(newState, () => this.updateTaskInAPI(taskId));
	}

	updateTaskInAPI(taskId) {
		const { tasks } = this.state;
		const currTask = tasks.find((task) => task.id === taskId);
		this.updateData(currTask);
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
					{tasks.map(({ name, time, id, isRunning }) => {
						return (
							<div key={id}>
								<header>
									{name}, {time}
								</header>
								<footer>
									<button
										onClick={() =>
											isRunning ? this.stopTask(id) : this.startTask(id)
										}>
										start/stop
									</button>
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

	updateData(data) {
		const options = {
			method: 'PUT',
			body: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json' },
		};

		return this.fetchData(options, `/${data.id}`);
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
