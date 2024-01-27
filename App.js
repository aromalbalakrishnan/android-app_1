// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Hi There!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView } from "react-native";

export default function App() {
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookDetails, setBookDetails] = useState({});
  const [bookImage, setBookImage] = useState("");

  const [books, setBooks] = useState([]);

  const makeApiCall = () => {
    setBookDetails({});
    setBookImage("");
    
    const formattedBookTitle = bookTitle.trim().replace(/ /g, '%');
    const formattedBookAuthor = bookAuthor.trim().replace(/ /g, '%');
    
    const query = formattedBookTitle && formattedBookAuthor? `intitle:${encodeURIComponent(formattedBookTitle)}+inauthor:${encodeURIComponent(formattedBookAuthor)}`
        : formattedBookTitle? `intitle:${encodeURIComponent(formattedBookTitle)}`
        : formattedBookAuthor? `inauthor:${encodeURIComponent(formattedBookAuthor)}`
        : "";

    fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
      .then((response) => response.json())
      .then((data) => {
        // handleResponse(data);
        setBooks(data.items || [])
      })
      .catch((error) => console.error(error));
  };

  const renderBooks = () => {
    return books.map((book, index) => {
      const volumeInfo = book.volumeInfo;
      const title = volumeInfo.title || "Title not available";
      const subtitle = volumeInfo.subtitle || "Subtitle not available";
      const authors = volumeInfo.authors ? volumeInfo.authors.join(", ") : "Author not available";
      const thumbnail = volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : "";
      const price = book.saleInfo && book.saleInfo.retailPrice ? `${book.saleInfo.retailPrice.amount} ${book.saleInfo.retailPrice.currencyCode}` : "Price not available";

      return (
        <View key={index} style={styles.bookContainer}>
          <Image source={{ uri: thumbnail }} style={styles.image} />
          <View style={styles.bookDetails}>
            <Text>Title: {title}</Text>
            <Text>Subtitle: {subtitle}</Text>
            <Text>Author: {authors}</Text>
            <Text>Price: {price}</Text>
          </View>
        </View>
      );
    });
  };

  const handleResponse = (response) => {
    let priceFlag = false;

    if (response.items && response.items.length > 0) {
      const book = response.items[0].volumeInfo;

      setBookDetails({
        title: book.title,
        subtitle: book.subtitle || "Subtitle not available",
        author: book.authors ? book.authors[0] : "Author not available",
      });

      if (book.imageLinks) {
        setBookImage(book.imageLinks.thumbnail);
      }

      for (let i = 0; i < response.items.length; i++) {
        if (
          response.items[i].saleInfo &&
          response.items[i].saleInfo.retailPrice
        ) {
          setBookDetails((prevState) => ({
            ...prevState,
            price: `${response.items[i].saleInfo.retailPrice.amount} ${response.items[i].saleInfo.retailPrice.currencyCode}`,
          }));
          priceFlag = true;
          break;
        }
      }

      if (!priceFlag) {
        setBookDetails((prevState) => ({
          ...prevState,
          price: "Price not Available",
        }));
      }
    } else {

      setBookDetails({ title: "No books found" });
      setBookImage('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter Book Title"
        onChangeText={(text) => setBookTitle(text)}
        value={bookTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Book Author"
        onChangeText={(text) => setBookAuthor(text)}
        value={bookAuthor}
      />
      <Button title="Search" onPress={makeApiCall} />
      {/* {bookImage ? (
        <Image source={{ uri: bookImage }} style={styles.image} />
      ) : null}
       {bookDetails.title === 'No books found' ? (
        <View style={styles.bookDetails}>
          <Text>{bookDetails.title}</Text>
        </View>
      ) : bookDetails.title ? ( // Check if bookDetails.title exists
        <View style={styles.bookDetails}>
          <Text>Title: {bookDetails.title}</Text>
          <Text>Sub Title: {bookDetails.subtitle}</Text>
          <Text>Author: {bookDetails.author}</Text>
          <Text>Price: {bookDetails.price}</Text>
        </View>
      ) : null}  */}
      <ScrollView style={styles.scrollView}>
        {renderBooks()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  input: {
    width: "80%",
    padding: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  scrollView: {
    width: "100%",
  },
  bookContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 150,
    borderRadius: 5,
  },
  bookDetails: {
    flex: 1,
    marginLeft: 10,
  },
});