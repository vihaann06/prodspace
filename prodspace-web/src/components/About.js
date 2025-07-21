import React from 'react';

const About = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-8">
    <div className="max-w-2xl w-full bg-gray-900 rounded-2xl shadow-xl p-10 border border-gray-700">
      <h1 className="text-4xl font-bold text-white mb-6 text-center">About ProdSpace</h1>
      <p className="text-lg text-gray-300 mb-6 text-center">
        ProdSpace is built on the motto that small actions, focused one day at a time, create sustainable habits over the long term.
        <br /><br />
        Our To-Do List and Calendar are designed to keep you focused on your tasks for today, cutting out the noise of future tasks so you can concentrate on what matters now. The Pomodoro Timer helps you work in focused bursts that match your attention span, while the Habit Tracker lets you see how these small, consistent actions each day are helping you build lasting habits.
        <br /><br />
        With ProdSpace, you can transform your productivity journey by taking it one day at a time.
      </p>
    </div>
  </div>
);

export default About; 