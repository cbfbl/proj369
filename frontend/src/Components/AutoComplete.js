import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import './AutoComplete.css';
import axios from 'axios';
import { withRouter } from 'react-router';

class Autocomplete extends Component {
	static propTypes = {
		suggestions: PropTypes.instanceOf(Array)
	};

	static defaultProps = {
		suggestions: []
	};

	constructor(props) {
		super(props);

		this.state = {
			// The active selection's index
			activeSuggestion: 0,
			// The suggestions that match the user's input
			filteredSuggestions: [],

			suggestions: [],

			// Whether or not the suggestion list is shown
			showSuggestions: false,
			// What the user has entered
			userInput: ''
		};
	}
	componentDidMount() {
		axios
			.get('http://127.0.0.1:5000/userslist')
			.then((response) => {
				this.setState({
					suggestions: response.data
				});
			})
			.catch((err) => {
				console.error(err);
			});
	}

	// Event fired when the input value is changed
	onChange = (e) => {
		// const { suggestions } = this.props.suggestions;
		const userInput = e.currentTarget.value;
		// Filter our suggestions that don't contain the user's input
		const filteredSuggestions = this.state.suggestions.filter(
			(suggestion) => suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
		);

		// Update the user input and filtered suggestions, reset the active
		// suggestion and make sure the suggestions are shown
		this.setState({
			activeSuggestion: 0,
			filteredSuggestions,
			showSuggestions: true,
			userInput: e.currentTarget.value
		});
	};

	// Event fired when the user clicks on a suggestion
	onClick = (e) => {
		this.props.history.push(`/user/` + e.currentTarget.innerText);
		// Update the user input and reset the rest of the state
		this.setState({
			activeSuggestion: 0,
			filteredSuggestions: [],
			showSuggestions: false,
			userInput: e.currentTarget.innerText
		});
	};

	// Event fired when the user presses a key down
	onKeyDown = (e) => {
		const { activeSuggestion, filteredSuggestions } = this.state;

		// User pressed the enter key, update the input and close the
		// suggestions
		if (e.keyCode === 13) {
			this.setState({
				activeSuggestion: 0,
				showSuggestions: false,
				userInput: filteredSuggestions[activeSuggestion]
			});
		} else if (e.keyCode === 38) {
			// User pressed the up arrow, decrement the index
			if (activeSuggestion === 0) {
				return;
			}

			this.setState({ activeSuggestion: activeSuggestion - 1 });
		} else if (e.keyCode === 40) {
			// User pressed the down arrow, increment the index
			if (activeSuggestion - 1 === filteredSuggestions.length) {
				return;
			}

			this.setState({ activeSuggestion: activeSuggestion + 1 });
		}
	};
	//The Autocomplete component renders an input and a list of suggestions
	render() {
		const {
			onChange,
			onClick,
			onKeyDown,
			state: { activeSuggestion, filteredSuggestions, showSuggestions, userInput }
		} = this;

		let suggestionsListComponent;
		//Use suggestionsListComponent to display the list, keep it in the Autocomplete
		if (showSuggestions && userInput) {
			if (filteredSuggestions.length) {
				suggestionsListComponent = (
					<ul className="suggestions">
						{filteredSuggestions.map((suggestion, index) => {
							let className;

							// Flag the active suggestion with a class
							if (index === activeSuggestion) {
								className = 'suggestion-active';
							}

							return (
								<li className={className} key={suggestion} onClick={onClick}>
									{suggestion}
								</li>
							);
						})}
					</ul>
				);
			} else {
				suggestionsListComponent = (
					<div className="no-suggestions">
						<em>No suggestions, you're on your own!</em>
					</div>
				);
			}
		}

		return (
			<Fragment>
				<input
					type="text"
					placeholder="Search User"
					onChange={onChange}
					onKeyDown={onKeyDown}
					value={userInput}
				/>
				{suggestionsListComponent}
			</Fragment>
		);
	}
}

export default withRouter(Autocomplete);
