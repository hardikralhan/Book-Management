const moment = require("moment")
const Counter = require("../models/CounterModel")

const book_counter = async () => {
    try {
        let find_book_counter = await Counter.findOne({type: "book_id"})
        if(!find_book_counter){
            (await Counter.create({type: "book_id", value: 1})).save()
            find_book_counter = await Counter.findOne({type: "book_id"})
            return "book-" + find_book_counter._doc.value
        }else{
            let counter = await Counter.findOneAndUpdate({
                type: "book_id"
            },
            {
                $set:{
                    value: find_book_counter._doc.value + 1
                }
            },
            {
                new:true
            })
            return "book-" + counter._doc.value
        }
        // let counter = await Counter.findByIdAndUpdate({
        //     _id: "book_id"
        // }, {
        //     $inc: {
        //         value: 1
        //     }
        // }, {
        //     upsert: true,
        //     new: true
        // })
        // return "book-" + counter._doc.value

    } catch (error) {
        console.log(error);
        return error
    }
}

const purchase_history_counter = async () => {
    try {
        const year = moment(this.purchase_date).format("YYYY")
        const month = moment(this.purchase_date).format("MM")
        // let counter = await Counter.findByIdAndUpdate({
        //     _id: "purchase_history_id"
        // }, {
        //     $inc: {
        //         va: 1
        //     }
        // }, {
        //     upsert: true,
        //     new: true
        // })
        // return `${year}-${month}-${counter._doc.value}`

        let find_purchase_counter = await Counter.findOne({type: "purchase_history_id"})
        if(!find_purchase_counter){
            (await Counter.create({type: "purchase_history_id", value: 1})).save()
            find_purchase_counter = await Counter.findOne({type: "purchase_history_id"})
            return `${year}-${month}-${find_purchase_counter._doc.value}`
        }else{
            let counter = await Counter.findOneAndUpdate({
                type: "purchase_history_id"
            },
            {
                $set:{
                    value: find_purchase_counter._doc.value + 1
                }
            },
            {
                new:true
            })
            return `${year}-${month}-${counter._doc.value}`
        }
        let tt = 1;
    } catch (error) {
        console.log(error);
        return error
    }

}

module.exports = {
    book_counter,
    purchase_history_counter
}