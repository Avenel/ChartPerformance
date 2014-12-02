using System;
using Xamarin.Forms;

namespace ChartPerformance
{
    public class ChartPage : ContentPage
    {
        public ChartPage(String title)
        {

            Title = title;
            Content = Link(title + ".sub");

        }

        private static Button Link(string name)
        {
            return new Button {
                Text = name,
                Command = new Command(o => App.MDPage.Detail.Navigation.PushAsync(App.CreateContentPage(name))),
            };
        }
    }
}

