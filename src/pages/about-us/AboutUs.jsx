import React, { useState } from 'react';
import './about-us.css'; // Make sure to import your CSS file

const cardsData = [
    {
        title: "Our Mission",
        content: [
            "Opening of the eyes of the masses of unregenerate church-folks and turning them from ignorance to the knowledge of the Lord and the riches therein.",
            "Opening of the eyes of other multitude outside Christendom and turning them to Christ and the riches therein. Isaiah 42:6.",
            "Restoring, Reviving and Unifying the body of Christ (the church) for the rapture. Ephesians 4:13.",
            "Healing the sick, Restoring the disabled, delivering the oppressed and possessed by devils and bringing the power of God to bear to the needy generally. Acts 10:38.",
            "Warning the adamant of the judgment to come."
        ],
        picture: ""
    },
    {
        title: "Aims & Objectives",
        content: [
            "To provide a code of conduct for Campus Fellowship Members and nurture them for the greater task of becoming the Christian leaders of tomorrow that the world greatly desires.",
            "To encourage and promote selfless service(s) of members of Watchman Catholic Charismatic Campus Fellowship.",
            "To emphasize the relevance and role of coordination in the development of Campus Fellowship.",
            "To work for the progress and advancement of oneness among the brethren in the fellowship.",
            "To encourage and promote harmonious interaction between Campus Fellowship Workers and that of the Parent Church."
        ],
        picture: ""
    },
    {
        title: "Our Meeting Days",
        content: [
            "Monday Charismatic Hour Service (6:00pm)",
            "Friday Bible Study (6:00pm)",
            "Sunday Service (7:00am)"
        ],
        picture: ""
    },
    {
        title: "General Supretendent",
        content: [
            "Pastor A.C Ohanebo",
        ],
        picture: ""
    }, {
        title: "Zonal Campus Coordinator",
        content: [
            "Pastor Osiriame O. Ediepo",
        ],
        picture: ""
    } , {
        title: "Campus Coordinator",
        content: [
            "Pastor Obed Ekenechukwu",
        ],
        picture: ""
    } , {
        title: "Assistant Campus Coordinator",
        content: [
            "Pastor Obinna Azubuguru",
        ],
        picture: ""
    } , {
        title: "Sister's Coordinator",
        content: [
            "Mama Sarah Ajoku",
        ],
        picture: ""
    }, {
        title: "Assitant Sister's Coordinator",
        content: [
            "Mama Blessing Momoh",
        ],
        picture: ""
    } 
];

const AboutUs = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % cardsData.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + cardsData.length) % cardsData.length);
    };

    return (
        <div className="about-us-container">
            <div className="about-us-content">
                <div className="card-container">
                    {cardsData.map((card, index) => (
                        <div
                            key={index}
                            className={`card ${index === currentIndex ? 'active' : ''}`}
                        >
                            <h2>{card.title}</h2>
                            {/* Displaying content array on different lines */}
                            {card.content.map((sentence, sentenceIndex) => (
                                <p key={sentenceIndex} className='sentence'>{sentence}</p>
                            ))}

                            {card.picture !== "" && <img src={card.picture} alt={card.title} className="card-image" />}

 
                        </div>

                            
                    ))}
                </div>

                <button className="arrow left" onClick={handlePrev}>&lt;</button>
                <button className="arrow right" onClick={handleNext}>&gt;</button>

            </div>

            
        </div>
    );
};

export default AboutUs;
