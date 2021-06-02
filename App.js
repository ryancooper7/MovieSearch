import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  Pressable,
  TouchableOpacity
} from 'react-native';
import { useState, useEffect } from 'react';

const apiKey = 'c9c4df2d';

const calculateMean = values => values.reduce((total, item) => total + item) / values.length;
const calculateStandardDeviation = values => Math.sqrt(values.map(value => Math.pow(value - calculateMean(values), 2)).reduce((total, x) => total + x) / values.length);
const calculateMedian = values => {
  if (values.length === 0) return 0;
  values.sort((a, b) => a - b);
  const halfIndex = Math.floor(values.length / 2);

  if (values.length % 2) {
    return values[halfIndex];
  }

  return (values[halfIndex - 1] + values[halfIndex]) / 2;
}

const App = () => {
  const [query, setQuery] = useState('');
  const [newMovie, setNewMovie] = useState(null);
  const [currentlySelectedMovies, setCurrentlySelectedMovies] = useState([]);
  const [searchError, setSearchError] = useState('');

  const search = async () => {
    const results = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&t=${query}&type=movie`);
    const resultsJSON = await results.json();
    if(resultsJSON.Error) {
      setSearchError(resultsJSON.Error);
    } else {
      setNewMovie(resultsJSON);
      setSearchError('');
    }
  }

  let mean = 0;
  let standardDeviation = 0;
  let median = 0;
  if (currentlySelectedMovies.length > 0) {
    // Calculate mean and standard deviation
    const boxOfficeArray = currentlySelectedMovies.map(currentlySelectedMovie => parseInt(currentlySelectedMovie.BoxOffice.replace(/\$|,/g, '')));
    mean = calculateMean(boxOfficeArray);
    standardDeviation = calculateStandardDeviation(boxOfficeArray);

    // Calculate median RT Score
     const rottenTomatoesArray = currentlySelectedMovies.map(movie => {
      return parseInt(movie.Ratings.find(rating => rating.Source === 'Rotten Tomatoes').Value.replace('%', ''));
    });
    median = calculateMedian(rottenTomatoesArray);
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.title}>Add More Movies</Text>
        <View style={styles.searchBarContainer}>
          <TextInput style={styles.searchBar} value={query} onChangeText={setQuery} />
          <TouchableOpacity style={styles.searchButton} onPress={search}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Search</Text>
          </TouchableOpacity>
        </View>
        {!!searchError && (
          <View style={styles.noNewMovie}>
            <Text>{searchError}</Text>
          </View>
        )}
        {(!searchError && !newMovie) && (
          <View style={styles.noNewMovie}>
            <Text>Search for a movie to add it to the data</Text>
          </View>
        )}
        {(!searchError && newMovie) && (
          <View style={styles.newMovie}>
            <Text numberOfLines={1} style={{marginLeft: 10, flex: 1}}>{newMovie.Title}</Text>
            <TouchableOpacity onPress={() => {
              if(currentlySelectedMovies.find(movie => movie.imdbID === newMovie.imdbID)) {
                setSearchError('Movie already selected, please search for a new one');
              } else if (newMovie.BoxOffice === 'N/A'){
                setSearchError('Movie does not contain box office data to display');
                setNewMovie(null);
              } else {
                setCurrentlySelectedMovies([...currentlySelectedMovies, newMovie]);
                setNewMovie(null);
                setQuery('');
              }
            }} style={[styles.icon]}>
              <Text style={{ fontSize: 22, color: 'green'}}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.dataContainer}>
          <Text style={styles.title}>Movie Data</Text>
          <View style={styles.dataPoint}>
            <Text style={{flex: 1}}>Box Office Mean</Text>
            <Text style={{flex: 1}}>{mean.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Text>
          </View>
          <View style={styles.dataPoint}>
            <Text style={{flex: 1}}>BO Standard Deviation</Text>
            <Text style={{flex: 1}}>{standardDeviation.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Text>
          </View>
          <View style={styles.dataPoint}>
            <Text style={{flex: 1}}>Median RT Score</Text>
            <Text style={{flex: 1}}>{median}%</Text>
          </View>
      </View>
      <View style={styles.resultsContainer} >
        <Text style={styles.title}>Currently Selected Movies</Text>
        <ScrollView style={styles.movieList}>
          {currentlySelectedMovies.map((movie, index) => (
            <View style={styles.newMovie} index={index} key={movie.imdbID}>
              <Text style={{ marginLeft: 10, flex: 1 }} numberOfLines={1}>{movie.Title}</Text>
              <TouchableOpacity onPress={() => {
                let newCurrentlySelectedMovies = [...currentlySelectedMovies];
                newCurrentlySelectedMovies.splice(index, 1)
                setCurrentlySelectedMovies(newCurrentlySelectedMovies);
              }} style={styles.icon}>
                <Text style={{ fontSize: 22, color: 'red' }}>x</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{height: 50}}></View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  searchContainer: {
    flexDirection: 'column',
    paddingTop: 20,
    paddingHorizontal: 30,
    height: 140
  },
  dataContainer: {
    flexDirection: 'column',
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingHorizontal: 30,
    height: 180,

  },
  resultsContainer: {
    flexDirection: 'column',
    paddingTop: 20,
    paddingHorizontal: 30,
    flex: 1,
  },
  searchBar: { 
    flex: 1,
    height: 35, 
    backgroundColor: '#c8c8c8', 
    borderRadius: 5, 
    marginRight: 20,
    paddingLeft: 10
  },
  searchButton: { 
    backgroundColor: 'blue', 
    height: 35, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 5, 
    padding: 5 
  },
  newMovie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center'
  },
  noNewMovie: {
    marginTop: 10,
    paddingTop: 10
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15
  },
  dataPoint: {
    flexDirection: 'row',
    marginTop: 10
  },
  icon: {
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  movieList: {
    paddingBottom: 150
  }
});

export default App;
