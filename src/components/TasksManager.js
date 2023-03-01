import React, { Component } from 'react';
import { getData, addData, updateData } from './API';

export default class TasksManager extends Component {
	constructor(props) {
		super(props);
		this.API_LINK = 'http://localhost:3005/data';
	}

	state = {
		tasks: [],
		task: '',
		errors: [],
	};

	/* --- EVENTS FUNCTIONS ---  */

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
			addData(data)
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
						errors: [],
					})
				);
		} else {
			this.setState({
				errors: ['Nie można dodać pustego zadania!'],
			});
		}
	};

	startTask = (taskId) => {
		if (!this.interval) {
			this.interval = setInterval(() => this.incrementTime(taskId), 1000);
		}
	};

	stopTask = (taskId) => {
		this.clearInterval();

		this.setTaskState(taskId, { isRunning: false });
	};

	finishTask = (taskId) => {
		if (this.interval) {
			this.clearInterval();
		}

		this.setTaskState(taskId, { isRunning: false, isDone: true });
	};

	removeTask = (taskId) => {
		this.setTaskState(taskId, { isRemoved: true });
	};

	/*  --- HELPERS ---  */

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

	clearInterval() {
		clearInterval(this.interval);
		this.interval = null;
	}

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

		this.setState(newState, () => {
			this.updateTaskInAPI(taskId);
			this.sortTask(this.state.tasks);
		});
	}

	updateTaskInAPI(taskId) {
		const { tasks } = this.state;
		const currTask = tasks.find((task) => task.id === taskId);
		updateData(currTask);
	}

	sortTask(tasks) {
		const sortedTasks = tasks.sort((a, b) => {
			return a.isDone - b.isDone;
		});

		this.setState({
			tasks: sortedTasks,
		});
	}

	showErrors(errorsBox) {
		return errorsBox.map((err, index) => <p key={index}>{err}</p>);
	}

	/*  --- RENDERING TASKS ---  */

	renderTasks(tasksToRender) {
		return tasksToRender.map(({ name, time, id, isRunning, isDone }) => {
			return (
				<div key={id}>
					<header>
						{name}, {time}
					</header>
					<footer>
						<button
							disabled={isDone}
							onClick={() =>
								isRunning ? this.stopTask(id) : this.startTask(id)
							}>
							start/stop
						</button>
						<button disabled={isDone} onClick={() => this.finishTask(id)}>
							zakończone
						</button>
						<button disabled={!isDone} onClick={() => this.removeTask(id)}>
							usuń
						</button>
					</footer>
				</div>
			);
		});
	}

	render() {
		const { tasks, task, errors } = this.state;
		const filteredTasks = tasks.filter((task) => task.isRemoved === false);

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
				{errors.length > 0 ? this.showErrors(errors) : null}
				<section>{this.renderTasks(filteredTasks)}</section>
			</section>
		);
	}

	componentDidMount() {
		getData().then((data) => {
			this.sortTask(data);
		});
	}
}
