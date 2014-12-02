using System;
using Xamarin.Forms;

namespace ChartPerformance
{
    public class MenuPage : ContentPage
    {

        public MenuPage(MasterDetailPage root)
        {
            Title = "Menü";
            Icon = Device.OS == TargetPlatform.iOS ? "menu.png" : null;
            Content = new StackLayout {
                Children = { MenuLink("Bars"), MenuLink("Columns"), MenuLink("Scatter Plot") }
            };
        }

        private Button MenuLink(string name)
        {
            return new Button {
                Text = name,
                Command = new Command(o => {
                    App.MDPage.Detail = new NavPage(App.CreateContentPage(name));
                    App.MDPage.IsPresented = false;
                }),
            };
        }

    }
}

