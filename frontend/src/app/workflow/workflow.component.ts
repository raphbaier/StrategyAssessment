import { Component, ViewChild, ElementRef } from '@angular/core';

// Expanded Step interface to include title and description separately
interface Step {
  title: string;
  description: string;
  videoUrl: string; // Still pointing to WebM video files
}

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css']
})
export class WorkflowComponent {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef; // Definite assignment assertion

  currentStepIndex = 0;
  steps: Step[] = [
    {
      title: 'Choose a Stock',
      //description: 'Start by choosing the stock you want to generate a signal for.<ul><li>Decide if you want to generate a Buy or Sell signal.</li><li>Consider market trends.</li></ul>', // this provides you the opportunity to create a strategy by combining
      // multiple different comparisons. You will be able to compare technical features as stock prices, fundamental features or advanced features such as emotions of CEO's or media intent (to come). You will not only be able to backtest your feature via going through
      // time, but also get possible improvements similar to your feature from the AI backend.

      description: `<p> Think back to some day you missed an opportunity in the stock market. Imagine today is that day!</p>
      <p>The Strategy Assessment enables you to create a strategy by combining multiple different comparisons. You will be able to compare technical,
      fundamental and advanced features.You will have the capability not only to backtest your
      strategy across different timeframes but also to uncover potential enhancements and alternatives that align with your strategy, all through the support of the AI backend.</p>
      <p>Start by choosing the stock to generate a signal for. Decide if you want to generate a Buy or Sell signal.</p>`,
      videoUrl: '/assets/s1.webm'
    },
    {
      title: 'Choose Feature',
      description: `Decide on the feature to use with the following steps:
      <ol>
        <li>Select the <strong>company</strong> you're interested in by <strong>pressing the affiliated node</strong> and <strong>selecting from the menu</strong>.</li>
        <li>Choose the <strong>feature</strong> source. Your options:
          <ul>
            <li><strong>Quarterly metrics</strong>: Updated quarterly.</li>
            <li><strong>Yearly metrics</strong>: Updated annually.</li>
            <li><strong>Daily trading metrics</strong>: Such as daily highs or volume.</li>
            <li><strong>Perceived CEO emotions</strong>: Based on the earnings conference call.</li>
          </ul>
        </li>
        <li>Identify the actual feature you wish to analyze.</li>
        <li>Determine the <strong>time frame</strong> relative to your <em>Spotlight Day</em>, e.g. 'last quarter' meaning the latest available quarterly value.
        </li>
      </ol>`,
            videoUrl: '/assets/s2.webm'
    },
    {
      title: 'Investigate the Data based on the Spotlight Day',
      description: ` <p>You might have noticed the YoY value appearing in blue below. This represents the value for the actual last quarter for the <em>Spotlight Day</em>.</p>
      <p>A <em>Spotlight Day</em> means we behave as if we have only the information available that existed on that specific day. This way, you can create your trading strategy as if you could relive the past.</p>
      <p>Interacting with the dates in the calendar allows you to update your <em>Spotlight Day</em>. This enables you to scroll through history, from September 2020 to September 2022, giving you a comprehensive view of past market movements and potential strategies.</p>`,
      videoUrl: '/assets/s3.webm'
    },
    {
      title: 'Discover price data',
      description: `<p>By modifying the price data flow, you're not limited to examining a price (or volume) for a <em>Spotlight Day</em>. Moreover, you are empowered to analyze the growth or decline (expressed as Delta) or calculate the moving average. Let's explore the process of discovering the growth for Henkel over the last 90 days:</p>
      <ol>
        <li>Select <strong>Henkel</strong> as the stock of interest.</li>
        <li>Choose <strong>Stock Price</strong> as your metric.</li>
        <li>Choose from the daily values, such as the daily <strong>High</strong>.</li>
        <li>To analyze the growth, select <strong>Delta</strong> as your comparison metric.</li>
        <li>Examine the growth <strong>from 90</strong> days before <strong>to 1</strong> day before the <em>Spotlight Day</em>.</li>
      </ol>`,
      videoUrl: '/assets/s4.webm'
    },
    {
      title: 'Finalize the flow to create a strategy',
      description: `<p>That's all the knowledge required to create a trading strategy. The key step involves comparing the identified value with another metric that you believe holds relevant information for generating a trading signal. For instance, if your criterion for a buy signal is <em>"Buy Beiersdorf if its Year-over-Year (YoY) growth outperformed Henkel's in the last quarter"</em>, follow these steps:</p>
      <ol>
        <li>Select the Buy signal option for Beiersdorf.</li>
        <li>Choose the YoY growth from the last quarter for Beiersdorf.</li>
        <li>Select the YoY growth from the last quarter for Henkel.</li>
        <li>Ensure the condition is set so Beiersdorf's YoY is greater than Henkel's.</li>
      </ol>`,
      //description: `That's all the knowledge to create a strategy. All you have to do is to compare the found value with something you think would hold relevant information for the signal. If your buy signal is "Buy Beiersdorf if it had a better YoY than Henkel last quarter": 1. Choose Buy signal for Beiersdorf. 2. Select last quarter's YoY for Beiersdorf 3. Select last quarter's YoY for Henkel 4. Set Beiersdorf's YoY to be larger.`,
      videoUrl: '/assets/s5.webm'
    },
    {
      title: 'Assess the strategy',
      //description: 'The algorithm goes through all dates from 2020 to 2022 and checks each day what your strategy would have done. Of course it takes into account brokerage fees! At the top you can see what would have happened if you invested 10,000 with your strategy. In the calendar, for a Buy signal, you see the days on which you would have held the stock in green. Short sellers see their days in red.',
      description: `<p>The algorithm scans through the dates from 2020 to 2022, buying and selling according to your strategy. Of course it pays brokerage fees! At the overview section, you'll be able to see the outcome of investing $10,000 following your strategy.</p>
      <p>In the calendar, for a 'Buy' signal, you see the days on which you would have possessed the stock in green. Short sellers see their days in red.</p>
      `,
      videoUrl: '/assets/s6.webm'
    },
    {
      title: 'Add another flow',
      //description: 'The algorithm goes through all dates from 2020 to 2022 and checks each day what your strategy would have done. Of course it takes into account brokerage fees! At the top you can see what would have happened if you invested 10,000 with your strategy. In the calendar, for a Buy signal, you see the days on which you would have held the stock in green. Short sellers see their days in red.',
      description: `<p>In this prototype, you have the capability to modify up to four flows to further refine your strategy. If all trigger for a day, this is seen as the respective signal. See how we can transform the previous strategy into: <em>"Buy Beiersdorf if its YoY growth outperformed Henkel's in the last quarter, yet its stock price hasn't grown as much."</em></p>`,
      videoUrl: '/assets/s7.webm'
    },
    {
      title: 'Get possible improvements',
      description: 'Once you\'re done, send the strategy to the AI backend to see if and how it can be improved. However, the backend only takes the past into account. So keep in mind a growing amount of final money doesn\'t necessarily mean a better strategy. Have fun exploring!',
      videoUrl: '/assets/s8.webm'
    }
  ];

  get currentStep(): Step {
    return this.steps[this.currentStepIndex];
  }

  ngAfterViewInit() {
    this.updateVideoSource();
  }

  updateVideoSource() {
    const videoElement: HTMLVideoElement = this.videoPlayer.nativeElement;
    videoElement.src = this.currentStep.videoUrl;
    videoElement.load();
  }

  goToNextStep(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.updateVideoSource();
    }
  }

  goToPreviousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.updateVideoSource();
    }
  }
}