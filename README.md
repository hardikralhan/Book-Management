Book Management

Sell Count Logic
The sellCount field is computed based on the total number of sales for a particular item. Whenever a sale occurs, the sellCount field for the corresponding item is incremented by the quantity of item purchased. 
Book table contains the sellCount initially 0 and when a retail user purchases the book it increases as per the quantity of the book purchased.

Similarily for total revenue of author, i am using RevenueGenerated model in which i have totalRevenue of author. revenue means how much money author has made on the sale of his books

For authentication, i have used jwt and for password encryption i have used bycrypt. Every api except login ans signup(email,password) in auth proof. I have made 3 signup and login(author,admin,retail users) based on roles defined.

I have made purchase History api's for all users, which shows purchase history of them. admin can see all the details of purchases.

We are adding book first, books can be added by admin and authors only. Books can be bought by users only.

Email Notification Mechanism

Email notifications are sent asynchronously using a message queue system.
After a book is added, bulk messages are send to every retail user on release of new book. a message containing the necessary email data (recipient, subject, content) is added to the message queue.
For adding it the queue i have used "bull" library, it takes message one by one, add it into the queue and then executes the process but it does 100 messages in 1 minute. 
Logic behind sending 100 messages in 1 minute is using process in queue and asking it to send only first 100 messages first which are in waiting and active and with the help on cron job in next one minute other 100 messages will be send. It will happen till all the messages are delivered.

I have send mesaages to the author with year month and sale of which book on sale of their each book. i have queue in that as well. but there is no limit in that. it will send email instantly to the author.

For email i have used nodemailer as a SMTP service.

Database Design and Implementation Choices
Schema Design
User Schema: Contains fields such as name, email, and password, role_id, user_id(uuvid()), active, address.
Book Schema: book_id(book-1,book-2...), authors( array of user_ids), sell_count, description, title, price, rating
Purchase History Schema: purchase_history_id(2023-02-1,2023-02-2,2023-02-3...), book_id, user_id, purchase_date, price, quantity
Revenue Generated: total_revenue, user_id
Counter Schema: type , value
Token Schema : user_id, token, expiresAt

Implementation Choices

I have used counter table to increment numbers based on the type for example i wanted on every purchase "purchase_id" should increase 1 by 1. so for that counter table will contain type as purchase_id and value 1 for starting and whenever purchase happens it will return me the value of type purchase_id.
similarily for book_id counter, i have used type as book_id and initail value 1. then value will increease on every book added as (book-1,book-2...)

On successful signup user details are entered into user table. and then that user can login with the email and password set during signing up and then token will be generated.
That token can be used for that user to add books if he/she is author/admin. if user -- can purchase a book and can view purchase history.

Users can view books on the basis of search. By searching books on the basis of title which is unique. by author's name. All books details will be shown by search.

Book schema contains authors user_ids to know which user's book is this. sell_count tell how many books have been sold, price tell the price of the book and rating tell how many ratings have been given to the book. rating is based on 1-5. 
Purchase History table contains book_id which means it tells which book is sold, user_id is added to know which user has made this sale, price tell of much price user has taken books, quantity tell the quantity of books sold.

Revenue Table tells the revenue made by author
