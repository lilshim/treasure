// Libraries
import React, { Component } from 'react';
import update from 'react-addons-update';

// UI
import {
  Navigator,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import Requester from '../utils/requester';
import CreateNoteModal from '../components/CreateNoteModal';
import MainMap from '../components/MainMap';

const routes = [
  { index: 0, title: 'Treasure' },
  { index: 1, title: 'Note' },
];

class MapPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalIsVisible: false,
      isPostingNote: false,
      postCoordIsValid: true,
      markers: [],
    };
  }

  componentWillMount() {
    Requester.get(
      'http://localhost:3000/geo_notes', {},
      geoNotes => {
        geoNotes = geoNotes.filter((e) => (e.latitude && e.longitude && e.note_text));
        this.setState({ markers: geoNotes });
      }
    );
  }

  _handleShowModal = () => {
    this.setState({ modalIsVisible: true });
  }

  _handlePostNote = (noteText, navigator) => {
    this.setState({
      isPostingNote: false,
    });

    const { postCoord } = this.state;
    var params = {
      note_text: noteText,
      latitude: postCoord.latitude,
      longitude: postCoord.longitude,
    };
    Requester.post(
      'http://localhost:3000/geo_notes',
      params,
      (newNote) => {
        this.setState(update(this.state, {
          markers: {$push: [newNote]},
        }));
        navigator.pop()
      }
    );
  }

  _handleHideModal = () => {
    this.setState({ modalIsVisible: false });
  }

  _updatePostCoord = (postCoord, postCoordIsValid) => {
    this.setState({
      postCoord,
      postCoordIsValid,
    });
  }

  _postNoteHandler = (navigator) => {
    const { isPostingNote } = this.state;
    if (isPostingNote) {
      navigator.push(routes[1]);
    } else {
      this.setState({ isPostingNote: !isPostingNote });
    }
  }

  _updatePostCoord = (postCoord) => {
    this.setState({ postCoord });
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  render() {
    const { isPostingNote, postCoordIsValid, markers } = this.state;
    return (
      <Navigator
        initialRoute={routes[0]}
        initialRoutes={routes}
        navigationBar={(
          <Navigator.NavigationBar
            routeMapper={{
              LeftButton: () => null,
              RightButton: (route, navigator, index, navState) => {
                let postNoteButtons;
                if (isPostingNote) {
                  postNoteButtons = (
                    <TouchableHighlight
                      onPress={() => navigator.push(routes[1])}
                      style={styles.button}
                      disabled={!postCoordIsValid}
                      key={1}
                    >
                      <Text>
                        {postCoordIsValid ? 'Set Location' : 'Fuck you, user.'}
                      </Text>
                    </TouchableHighlight>
                  );
                } else {
                  postNoteButtons = (
                    <TouchableHighlight
                      onPress={() => {this.setState({
                        isPostingNote: true,
                        postCoordIsValid: true,
                      });}}
                      style={styles.button}
                    >
                      <Text>Post Note</Text>
                    </TouchableHighlight>
                  );
                }
                return (
                  <View>{postNoteButtons}</View>
                )
              },
              Title: (route, navigator, index, navState) => (
                <Text style={styles.text}>{route.title}</Text>
              ),
            }}
            style={styles.navbar}
          />
        )}
        renderScene={(route, navigator) => {
          if (route.index == 0) {
            return (
              <View style={styles.container}>
                <MainMap
                  markers={markers}
                  isPostingNote={isPostingNote}
                  updatePostCoord={this._updatePostCoord}
                />
              </View>
            );
          } else {
            return (
              <CreateNoteModal
                isVisible={true}
                onCancel={this._handleHideModal}
                onPost={(text) => this._handlePostNote(text, navigator)}
              />
            );
        }}}
      />
    );
  }
}

// --------------------------------------------------
// Styles
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
  },
  button: {
    backgroundColor: '#eeeeee',
    padding: 10,
    marginRight: 5,
    marginLeft: 5,
  },
  navbar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF765F',
    shadowColor: '#333333',
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  text: {
    paddingTop: 8,
    color: 'white',
    fontFamily: 'JosefinSans-Bold',
    fontSize: 24,
  },
});

export default MapPage;
