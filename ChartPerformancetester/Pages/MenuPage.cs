using System;
using Xamarin.Forms;

namespace ChartPerformancetester
{
	public class MenuPage : ContentPage
	{
		public MenuPage ()
		{
			BackgroundColor = Color.FromHex("333333");

			var layout = new StackLayout { Spacing = 0, VerticalOptions = LayoutOptions.FillAndExpand };

			var label = new ContentView {
				Padding = new Thickness(10, 36, 0, 5),
				Content = new Xamarin.Forms.Label {
					TextColor = Color.FromHex("AAAAAA"),
					Text = "MENU", 
				}
			};

			layout.Children.Add(label);

			Content = layout;
		}
	}
}

